import csv
import logging
import os
from pathlib import Path
from typing import Any, Dict, List

import requests
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest

logger = logging.getLogger(__name__)

RAG_COLLECTION_NAME = "hackathon"
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text:latest")
OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "qwen2.5:7b")
BATCH_SIZE = 64


def _qdrant_client() -> QdrantClient:
    return QdrantClient(url=QDRANT_URL)


def _collection_exists(client: QdrantClient) -> bool:
    try:
        client.get_collection(RAG_COLLECTION_NAME)
        return True
    except Exception:
        return False


def _make_text_from_row(row: Dict[str, Any]) -> str:
    # Destructuring whole row into a single content text
    parts = []
    for k, v in row.items():
        parts.append(f"{k}: {v}")
    return "\n".join(parts)


def _flatten_embedding(value: Any) -> List[float]:
    if isinstance(value, dict):
        raise RuntimeError(f"Unexpected nested dict in embedding payload: {value}")

    if isinstance(value, list) and value and all(isinstance(item, list) for item in value):
        if len(value) == 1:
            value = value[0]
        else:
            raise RuntimeError(f"Unexpected 2D embedding array with multiple vectors: {value}")

    if not isinstance(value, list):
        raise RuntimeError(f"Embedding vector must be a list of numbers, got: {type(value).__name__}")

    if not all(isinstance(item, (int, float)) for item in value):
        raise RuntimeError(f"Embedding vector contains non-numeric values: {value}")

    return [float(item) for item in value]


def _parse_ollama_embed_response(data: Any, expected_count: int) -> List[List[float]]:
    if isinstance(data, dict) and "data" in data:
        items = data["data"]
    elif isinstance(data, dict) and "embeddings" in data:
        items = data["embeddings"]
    elif isinstance(data, dict) and "embedding" in data:
        items = [data["embedding"]]
    else:
        raise RuntimeError(f"Invalid Ollama embed response: {data}")

    if not isinstance(items, list):
        raise RuntimeError(f"Invalid embeddings payload type: {type(items).__name__} -- {items}")

    embeddings: List[List[float]] = []
    for item in items:
        if isinstance(item, dict):
            if "embedding" in item:
                embeddings.append(_flatten_embedding(item["embedding"]))
            elif "embeddings" in item:
                embeddings.append(_flatten_embedding(item["embeddings"]))
            else:
                raise RuntimeError(f"Missing embedding field in Ollama response item: {item}")
        else:
            embeddings.append(_flatten_embedding(item))

    if expected_count != len(embeddings):
        raise RuntimeError(
            f"Ollama returned {len(embeddings)} embedding(s) but expected {expected_count}: {data}"
        )

    return embeddings


def _ollama_embed(texts: List[str]) -> List[List[float]]:
    if len(texts) == 0:
        return []

    url = f"{OLLAMA_URL}/api/embed"
    payload = {"model": OLLAMA_EMBED_MODEL, "input": texts}

    logger.debug("Sending Ollama embed request to %s", url)
    logger.debug("Ollama embed payload: %s", {"model": payload["model"], "input_length": len(texts)})

    try:
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.exception("Ollama embedding request failed")
        raise RuntimeError(f"Failed to fetch embeddings from Ollama: {exc}") from exc

    try:
        data = response.json()
    except ValueError as exc:
        logger.exception("Invalid JSON in Ollama embedding response")
        raise RuntimeError(f"Invalid JSON response from Ollama: {response.text}") from exc

    logger.debug("Ollama embed response: %s", data)

    embeddings = _parse_ollama_embed_response(data, expected_count=len(texts))
    logger.debug("Parsed %d embeddings, first vector length=%d", len(embeddings), len(embeddings[0]) if embeddings else 0)

    return embeddings


def _ollama_chat(prompt: str) -> str:
    url = f"{OLLAMA_URL}/api/chat"
    payload = {
        "model": OLLAMA_CHAT_MODEL,
        "messages": [
            {"role": "system", "content": "You are an assistant that answers medicine and drug information questions using the provided context."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.0,
    }
    response = requests.post(url, json=payload, timeout=120)
    response.raise_for_status()
    data = response.json()

    if "choices" in data and len(data["choices"]) > 0:
        choice = data["choices"][0]
        message = choice.get("message", {})
        text = message.get("content") or choice.get("text")
        if text is not None:
            return text

    if "text" in data:
        return data["text"]

    raise RuntimeError(f"Invalid Ollama chat response: {data}")


def ingest_medicine_details(csv_path: str = "Medicine_Details.csv") -> Dict[str, Any]:
    base_path = Path(__file__).resolve().parent
    resolved_path = (base_path / csv_path).resolve()
    if not resolved_path.exists():
        legacy = (base_path / "rag" / csv_path).resolve()
        if legacy.exists():
            resolved_path = legacy
        else:
            raise FileNotFoundError(f"Medicine details CSV not found: {resolved_path} or {legacy}")

    client = _qdrant_client()
    if _collection_exists(client):
        client.delete_collection(RAG_COLLECTION_NAME)

    points = []
    rows = []

    with open(resolved_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            text = _make_text_from_row(row)
            rows.append((i, text, row))

    if len(rows) == 0:
        raise ValueError("No rows found in CSV file")

    # embed in batches using Ollama
    for start in range(0, len(rows), BATCH_SIZE):
        batch = rows[start : start + BATCH_SIZE]
        texts = [item[1] for item in batch]
        embeddings = _ollama_embed(texts)

        for (idx, text, row), emb in zip(batch, embeddings):
            point_id = str(idx)
            payload = {
                "text": text,
                "csv_row": row,
            }
            points.append(rest.PointStruct(id=point_id, vector=emb, payload=payload))

    vector_size = len(embeddings[0]) if len(rows) > 0 else 0
    client.recreate_collection(
        collection_name=RAG_COLLECTION_NAME,
        vectors_config=rest.VectorParams(size=vector_size, distance=rest.Distance.COSINE),
    )

    client.upsert(
        collection_name=RAG_COLLECTION_NAME,
        points=points,
    )

    return {
        "collection_name": RAG_COLLECTION_NAME,
        "qdrant_url": QDRANT_URL,
        "rows_ingested": len(rows),
        "points_indexed": len(points),
    }


def query_medicine_rag(query_text: str, top_k: int = 5) -> Dict[str, Any]:
    client = _qdrant_client()
    if client.get_collection(RAG_COLLECTION_NAME, skip_missing=True) is None:
        raise RuntimeError("RAG collection not found. Ingest data first via /rag/ingest")

    query_vector = _ollama_embed([query_text])[0]

    hits = client.search(
        collection_name=RAG_COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k,
        with_payload=True,
    )

    sources = []
    context_snippets = []
    for h in hits:
        source = {
            "id": h.id,
            "score": h.score,
            "payload": h.payload,
        }
        sources.append(source)
        text = h.payload.get("text") if isinstance(h.payload, dict) else ""
        if text:
            context_snippets.append(text)

    prompt = f"You are an assistant. Use the following medicine details to answer query.\n\n" + "\n---\n".join(context_snippets)
    prompt += f"\n\nQuestion: {query_text}\nAnswer:"

    answer = _ollama_chat(prompt).strip()

    return {
        "query": query_text,
        "answer": answer,
        "source_count": len(sources),
        "sources": sources,
    }

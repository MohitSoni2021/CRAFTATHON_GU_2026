import requests
from qdrant_client import QdrantClient

QDRANT_URL = "http://localhost:6333"
COLLECTION_NAME = "medicine_details"
OLLAMA_URL = "http://127.0.0.1:11434"
EMBED_MODEL = "nomic-embed-text"
LLM_MODEL = "qwen2.5:7b"


# =========================
# Embedding
# =========================
def get_embedding(text: str):
    response = requests.post(
        f"{OLLAMA_URL}/api/embeddings",
        json={"model": EMBED_MODEL, "prompt": text},
    )

    data = response.json()

    if "embedding" in data:
        return data["embedding"]
    elif "embeddings" in data:
        return data["embeddings"][0]
    else:
        raise ValueError(f"Invalid embedding response: {data}")


# =========================
# Build context
# =========================
def build_context(results):
    context_parts = []

    for r in results:
        payload = r.payload or {}
        text = "\n".join(f"{k}: {v}" for k, v in payload.items())
        context_parts.append(text)

    return "\n\n---\n\n".join(context_parts)


# =========================
# MAIN FUNCTION (THIS YOU NEED)
# =========================
def ask_medicine_ai(user_query: str) -> str:
    # 1. Connect Qdrant
    client = QdrantClient(url=QDRANT_URL)

    # 2. Convert query to vector
    query_vector = get_embedding(user_query)

    # 3. Search similar documents
    search_results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=5,
    )

    # 4. Build context
    context = build_context(search_results)

    # 5. Prompt
    prompt = f"""
You are a medical assistant AI.

Answer ONLY based on the given context.

Context:
{context}

User Question:
{user_query}

Give a clear, helpful, and short answer.
"""

    # 6. Call Ollama LLM
    response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model": LLM_MODEL,
            "prompt": prompt,
            "stream": False
        }
    )

    result = response.json()

    return result.get("response", "No response generated.")


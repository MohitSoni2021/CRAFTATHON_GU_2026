from pathlib import Path
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import FileResponse

# Always load core service if possible
try:
    from pythonBackend.services import generate_dataset
except ImportError:
    from .services import generate_dataset

# Load optional RAG module if dependencies are installed
rag_available = False
dummy_available = False
ingest_medicine_details = None
query_medicine_rag = None
dummy = None
ask_medicine_ai = None

try:
    from pythonBackend.rag import ingest_medicine_details, query_medicine_rag, dummy
    from pythonBackend.chat import ask_medicine_ai
    rag_available = True
    dummy_available = True
except ImportError:
    try:
        from .rag import ingest_medicine_details, query_medicine_rag, dummy
        from .chat import ask_medicine_ai
        rag_available = True
        dummy_available = True
    except ImportError:
        try:
            from pythonBackend.rag import ingest_medicine_details, query_medicine_rag
            from pythonBackend.chat import ask_medicine_ai
            rag_available = True
        except ImportError:
            try:
                from .rag import ingest_medicine_details, query_medicine_rag
                from .chat import ask_medicine_ai
                rag_available = True
            except ImportError:
                rag_available = False

app = FastAPI(title="MedTrack Analytics Pipeline", version="1.0")

app = FastAPI(title="MedTrack Analytics Pipeline", version="1.0")


@app.get("/generate-dataset")
async def api_generate_dataset(start: str = Query(None, description="Start date YYYY-MM-DD"), end: str = Query(None, description="End date YYYY-MM-DD")):
    """Generate dataset rows with adherence summary for each (user, medication, date)."""
    try:
        dataset_rows, per_user_summary, overall_summary = await generate_dataset(start=start, end=end)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dataset: {e}")

    return {
        "rows": dataset_rows,
        "per_user_summary": per_user_summary,
        "overall_summary": overall_summary,
        "csv_path": "./medtrack_dataset.csv",
    }


@app.get("/export-csv")
async def api_export_csv(start: str = Query(None, description="Start date YYYY-MM-DD"), end: str = Query(None, description="End date YYYY-MM-DD")):
    """Convert the dataset to CSV and return the file path content."""
    try:
        _, _, _ = await generate_dataset(start=start, end=end)
        return FileResponse("./medtrack_dataset.csv", media_type="text/csv", filename="medtrack_dataset.csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate CSV: {e}")




@app.get("/rag/query")
def api_rag_query(q: str = Query(..., description="Question for RAG model"), top_k: int = Query(5, description="Number of returned passages")):
    """Query the RAG model over medicine details."""
    if not rag_available or ask_medicine_ai is None:
        raise HTTPException(status_code=503, detail="RAG dependencies not installed (requests/qdrant-client). Install requirements to enable this endpoint.")
    try:
        answer = ask_medicine_ai(str(q))
        return {"answer": answer}
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query RAG data: {e}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("pythonBackend.main:app", host="0.0.0.0", port=8000, reload=True)


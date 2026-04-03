from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import FileResponse

try:
    # Preferred inside package import (for uvicorn module usage)
    from .services import generate_dataset
except ImportError:
    # Fallback when running script directly from folder
    from services import generate_dataset

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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("pythonBackend.main:app", host="0.0.0.0", port=8000, reload=True)


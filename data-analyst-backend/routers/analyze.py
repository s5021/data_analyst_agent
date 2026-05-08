from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from services.data_service import load_dataframe, get_summary, get_correlation_matrix
from services.ai_service import ask_ai_analyst
import io

router = APIRouter()

class AnalyzeRequest(BaseModel):
    file_id: str
    question: str

@router.get("/summary/{file_id}")
def data_summary(file_id: str):
    try:
        df = load_dataframe(file_id)
        return get_summary(df)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

@router.get("/correlation/{file_id}")
def get_correlation(file_id: str):
    """Get correlation matrix for numeric columns"""
    try:
        df = load_dataframe(file_id)
        return get_correlation_matrix(df)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.get("/export/{file_id}")
def export_data(file_id: str):
    """Export data as CSV"""
    try:
        df = load_dataframe(file_id)
        
        # Convert to CSV
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)
        
        return StreamingResponse(
            iter([csv_buffer.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=data_export_{file_id}.csv"}
        )
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

@router.post("/ask")
async def ask_question(req: AnalyzeRequest):
    df = load_dataframe(req.file_id)
    summary = get_summary(df)
    answer = await ask_ai_analyst(req.question, summary)
    return {"question": req.question, "answer": answer}
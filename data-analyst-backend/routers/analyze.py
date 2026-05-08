from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.data_service import load_dataframe, get_summary
from services.ai_service import ask_ai_analyst

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

@router.post("/ask")
async def ask_question(req: AnalyzeRequest):
    df = load_dataframe(req.file_id)
    summary = get_summary(df)
    answer = await ask_ai_analyst(req.question, summary)
    return {"question": req.question, "answer": answer}
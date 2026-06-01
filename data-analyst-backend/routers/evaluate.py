from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service        import ask_ai_analyst
from services.evaluator_service import evaluate_response
from services.data_service      import load_dataframe, get_summary

router = APIRouter()

class EvaluateRequest(BaseModel):
    file_id: str
    question: str

@router.post("/ask")
async def evaluated_ask(req: EvaluateRequest):
    try:
        df      = load_dataframe(req.file_id)
        summary = get_summary(df)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

    # LLM 1 — GPT-4o generates the answer
    ai_answer = await ask_ai_analyst(req.question, summary)

    # LLM 2 — Phi-4-mini-reasoning evaluates it independently
    evaluation = await evaluate_response(req.question, ai_answer, summary)

    return {
        "question":        req.question,
        "answer":          ai_answer,
        "evaluation":      evaluation,
        "generator_model": "gpt-4o (Azure AI Foundry)",
        "evaluator_model": evaluation.get("evaluator_model", "phi-4-mini-reasoning")
    }
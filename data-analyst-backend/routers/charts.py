from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from services.data_service import load_dataframe
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend — critical for servers
import matplotlib.pyplot as plt
import uuid

router = APIRouter()

class ChartRequest(BaseModel):
    file_id: str
    chart_type: str   # "bar", "line", "scatter", "hist"
    x_col: str
    y_col: str | None = None
    title: str = "Chart"

@router.post("/generate")
def generate_chart(req: ChartRequest):
    df = load_dataframe(req.file_id)

    if req.x_col not in df.columns:
        raise HTTPException(400, f"Column '{req.x_col}' not found")

    fig, ax = plt.subplots(figsize=(10, 6))

    if req.chart_type == "bar":
        df[req.x_col].value_counts().plot(kind="bar", ax=ax)
    elif req.chart_type == "line" and req.y_col:
        df.plot(x=req.x_col, y=req.y_col, kind="line", ax=ax)
    elif req.chart_type == "scatter" and req.y_col:
        df.plot(x=req.x_col, y=req.y_col, kind="scatter", ax=ax)
    elif req.chart_type == "hist":
        df[req.x_col].plot(kind="hist", ax=ax)
    else:
        raise HTTPException(400, "Invalid chart type or missing y_col")

    ax.set_title(req.title)
    plt.tight_layout()

    chart_id = str(uuid.uuid4())
    chart_path = f"charts/{chart_id}.png"
    fig.savefig(chart_path, dpi=150, bbox_inches="tight")
    plt.close(fig)

    return {"chart_id": chart_id, "url": f"/charts/{chart_id}.png"}
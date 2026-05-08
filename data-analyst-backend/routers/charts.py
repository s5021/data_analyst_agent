from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from services.data_service import load_dataframe
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend — critical for servers
import matplotlib.pyplot as plt
import seaborn as sns
import uuid

router = APIRouter()

class ChartRequest(BaseModel):
    file_id: str
    chart_type: str   # "bar", "line", "scatter", "hist", "pie", "heatmap"
    x_col: str
    y_col: str | None = None
    title: str = "Chart"

@router.post("/generate")
def generate_chart(req: ChartRequest):
    df = load_dataframe(req.file_id)

    if req.x_col not in df.columns and req.chart_type != "heatmap":
        raise HTTPException(400, f"Column '{req.x_col}' not found")

    fig, ax = plt.subplots(figsize=(10, 6))

    try:
        if req.chart_type == "bar":
            df[req.x_col].value_counts().plot(kind="bar", ax=ax, color='#00d4ff')
            ax.set_xlabel(req.x_col)
            ax.set_ylabel("Count")
            
        elif req.chart_type == "line" and req.y_col:
            df.plot(x=req.x_col, y=req.y_col, kind="line", ax=ax, color='#7c3aed', linewidth=2)
            ax.set_xlabel(req.x_col)
            ax.set_ylabel(req.y_col)
            
        elif req.chart_type == "scatter" and req.y_col:
            df.plot(x=req.x_col, y=req.y_col, kind="scatter", ax=ax, color='#06ffa5', alpha=0.6)
            ax.set_xlabel(req.x_col)
            ax.set_ylabel(req.y_col)
            
        elif req.chart_type == "hist":
            df[req.x_col].plot(kind="hist", ax=ax, color='#00d4ff', alpha=0.7, bins=20)
            ax.set_xlabel(req.x_col)
            ax.set_ylabel("Frequency")
            
        elif req.chart_type == "pie":
            # Pie chart for categorical data
            value_counts = df[req.x_col].value_counts().head(10)  # Top 10 categories
            colors = ['#00d4ff', '#7c3aed', '#06ffa5', '#ff6b9d', '#ffd93d', 
                     '#00e5ff', '#8b5cf6', '#34d399', '#f472b6', '#fbbf24']
            value_counts.plot(kind="pie", ax=ax, autopct='%1.1f%%', colors=colors, startangle=90)
            ax.set_ylabel('')  # Remove y-label for pie chart
            
        elif req.chart_type == "heatmap":
            # Correlation heatmap for numeric columns only
            numeric_df = df.select_dtypes(include=['number'])
            if numeric_df.empty:
                raise HTTPException(400, "No numeric columns found for heatmap")
            
            corr_matrix = numeric_df.corr()
            sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm', 
                       center=0, square=True, linewidths=1, cbar_kws={"shrink": 0.8}, ax=ax)
            ax.set_title("Correlation Heatmap")
            
        else:
            raise HTTPException(400, "Invalid chart type or missing y_col")

        ax.set_title(req.title, fontsize=14, fontweight='bold')
        ax.grid(alpha=0.3, linestyle='--') if req.chart_type not in ['pie', 'heatmap'] else None
        plt.tight_layout()

        chart_id = str(uuid.uuid4())
        chart_path = f"charts/{chart_id}.png"
        fig.savefig(chart_path, dpi=150, bbox_inches="tight", facecolor='white')
        plt.close(fig)

        return {"chart_id": chart_id, "url": f"/charts/{chart_id}.png"}
        
    except Exception as e:
        plt.close(fig)
        raise HTTPException(400, f"Error generating chart: {str(e)}")
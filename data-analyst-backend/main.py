from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import upload, analyze, charts
import os

app = FastAPI(title="Data Analyst AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("charts", exist_ok=True)

app.mount("/charts", StaticFiles(directory="charts"), name="charts")

app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["Analyze"])
app.include_router(charts.router, prefix="/api/charts", tags=["Charts"])
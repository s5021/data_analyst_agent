from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil, os, uuid

router = APIRouter()

ALLOWED_TYPES = {
    "text/csv", "application/json",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only CSV, Excel, or JSON files allowed")

    file_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1]
    save_path = f"uploads/{file_id}.{ext}"

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"file_id": file_id, "filename": file.filename, "path": save_path}
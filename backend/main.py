from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models
from database import engine
from routers import auth, photos, albums # Đảm bảo có đủ 3 router này
import os

# Tự động tạo database và các bảng
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gallery App API")

# CẤU HÌNH CORS (Phải nằm TRƯỚC include_router)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cấu hình thư mục chứa ảnh
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Gộp các Router
app.include_router(auth.router)
app.include_router(photos.router)
app.include_router(albums.router)

@app.get("/")
def root():
    return {"message": "API is running!"}
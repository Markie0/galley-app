from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os, uuid, io, shutil
from PIL import Image
from typing import List, Optional
import crud, models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/photos", tags=["photos"])
UPLOAD_DIR = "uploads"

@router.post("/", response_model=schemas.Photo)
async def upload_photo(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    album_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File phải là ảnh")
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))
    width, height = img.size
    if img.mode in ("RGBA", "P"): img = img.convert("RGB")
    unique_filename = f"{uuid.uuid4()}.jpg"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    img.save(file_path, "JPEG", quality=75, optimize=True)
    file_size = os.path.getsize(file_path)
    photo_in = schemas.PhotoCreate(title=title, description=description, album_id=album_id)
    return crud.create_user_photo(db=db, photo=photo_in, user_id=current_user.id, image_url=f"/uploads/{unique_filename}", size=file_size, width=width, height=height)

@router.get("/", response_model=List[schemas.Photo])
def read_photos(search: Optional[str] = None, album_id: Optional[int] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_photos(db, user_id=current_user.id, search=search, album_id=album_id)

@router.get("/{photo_id}", response_model=schemas.Photo)
def read_photo(photo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_photo = crud.get_photo(db, photo_id=photo_id)
    if not db_photo or db_photo.user_id != current_user.id: raise HTTPException(status_code=404, detail="Không tìm thấy")
    return db_photo

@router.put("/{photo_id}", response_model=schemas.Photo)
def update_photo(photo_id: int, photo_update: schemas.PhotoUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_photo = crud.get_photo(db, photo_id=photo_id)
    if not db_photo or db_photo.user_id != current_user.id: raise HTTPException(status_code=404, detail="Lỗi")
    return crud.update_photo(db=db, photo_id=photo_id, photo_update=photo_update)

@router.delete("/{photo_id}")
def delete_photo(photo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_photo = crud.get_photo(db, photo_id=photo_id)
    if not db_photo or db_photo.user_id != current_user.id: raise HTTPException(status_code=404, detail="Lỗi")
    file_path = os.path.join(UPLOAD_DIR, db_photo.image_url.split("/")[-1])
    if os.path.exists(file_path): os.remove(file_path)
    crud.delete_photo(db=db, photo_id=photo_id)
    return {"message": "Xóa thành công"}

@router.patch("/{photo_id}/favorite", response_model=schemas.Photo)
def toggle_favorite(photo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_photo = crud.get_photo(db, photo_id=photo_id)
    if not db_photo or db_photo.user_id != current_user.id: raise HTTPException(status_code=404, detail="Lỗi")
    return crud.toggle_favorite(db=db, photo_id=photo_id)

# --- API CHIA SẺ ---
@router.post("/{photo_id}/share", response_model=schemas.Photo)
def generate_share_link(photo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_photo = crud.get_photo(db, photo_id=photo_id)
    if not db_photo or db_photo.user_id != current_user.id: raise HTTPException(status_code=404)
    if not db_photo.share_uuid:
        db_photo.share_uuid = str(uuid.uuid4())
        db.commit()
        db.refresh(db_photo)
    return db_photo

@router.get("/public/{share_uuid}", response_model=schemas.Photo)
def get_public_photo(share_uuid: str, db: Session = Depends(get_db)):
    db_photo = db.query(models.Photo).filter(models.Photo.share_uuid == share_uuid).first()
    if not db_photo: raise HTTPException(status_code=404, detail="Link hết hạn")
    return db_photo
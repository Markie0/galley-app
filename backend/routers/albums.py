from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import crud, models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/albums",
    tags=["albums"]
)

# 1. Lấy danh sách tất cả Album của người dùng
@router.get("/", response_model=List[schemas.Album])
def read_albums(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_albums(db, user_id=current_user.id)

# 2. Tạo Album mới
@router.post("/", response_model=schemas.Album)
def create_new_album(
    album: schemas.AlbumCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_album(db=db, album=album, user_id=current_user.id)

# 3. Xóa Album
@router.delete("/{album_id}")
def delete_existing_album(
    album_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Kiểm tra xem album có tồn tại và thuộc về user không
    db_album = db.query(models.Album).filter(models.Album.id == album_id).first()
    if not db_album or db_album.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Không tìm thấy Album")
    
    crud.delete_album(db=db, album_id=album_id)
    return {"message": "Đã xóa Album thành công"}
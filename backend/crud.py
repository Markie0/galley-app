from sqlalchemy.orm import Session
import models, schemas

# --- LOGIC CHO USER ---
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- LOGIC CHO ALBUM ---
def create_album(db: Session, album: schemas.AlbumCreate, user_id: int):
    db_album = models.Album(name=album.name, user_id=user_id)
    db.add(db_album)
    db.commit()
    db.refresh(db_album)
    return db_album

def get_albums(db: Session, user_id: int):
    return db.query(models.Album).filter(models.Album.user_id == user_id).all()

def delete_album(db: Session, album_id: int):
    db_album = db.query(models.Album).filter(models.Album.id == album_id).first()
    if db_album:
        # Khi xóa album, các ảnh thuộc album đó sẽ chuyển về trạng thái không album (null)
        db.query(models.Photo).filter(models.Photo.album_id == album_id).update({models.Photo.album_id: None})
        db.delete(db_album)
        db.commit()
        return True
    return False

# --- LOGIC CHO PHOTO ---
def get_photos(db: Session, user_id: int, search: str = None, album_id: int = None):
    query = db.query(models.Photo).filter(models.Photo.user_id == user_id)
    if search:
        query = query.filter(models.Photo.title.contains(search))
    if album_id:
        query = query.filter(models.Photo.album_id == album_id)
    return query.order_by(models.Photo.uploaded_at.desc()).all()

def get_photo(db: Session, photo_id: int):
    return db.query(models.Photo).filter(models.Photo.id == photo_id).first()

def create_user_photo(db: Session, photo: schemas.PhotoCreate, user_id: int, image_url: str, size: int, width: int, height: int):
    db_photo = models.Photo(
        **photo.model_dump(),
        image_url=image_url,
        user_id=user_id,
        size=size,
        width=width,
        height=height,
        format="JPEG",
        is_favorite=False
    )
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo

def update_photo(db: Session, photo_id: int, photo_update: schemas.PhotoUpdate):
    db_photo = get_photo(db, photo_id)
    if db_photo:
        update_data = photo_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_photo, key, value)
        db.commit()
        db.refresh(db_photo)
    return db_photo

def delete_photo(db: Session, photo_id: int):
    db_photo = get_photo(db, photo_id)
    if db_photo:
        db.delete(db_photo)
        db.commit()
        return True
    return False

def toggle_favorite(db: Session, photo_id: int):
    db_photo = get_photo(db, photo_id)
    if db_photo:
        db_photo.is_favorite = not db_photo.is_favorite
        db.commit()
        db.refresh(db_photo)
    return db_photo
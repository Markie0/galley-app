from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class AlbumBase(BaseModel):
    name: str
class AlbumCreate(AlbumBase): pass
class Album(AlbumBase):
    id: int
    user_id: int
    class Config: from_attributes = True

class PhotoBase(BaseModel):
    title: str
    description: Optional[str] = None
    album_id: Optional[int] = None
class PhotoCreate(PhotoBase): pass
class PhotoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_favorite: Optional[bool] = None
    album_id: Optional[int] = None

class Photo(PhotoBase):
    id: int
    image_url: str
    is_favorite: bool
    share_uuid: Optional[str] = None
    size: Optional[int] = None
    format: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    uploaded_at: datetime
    user_id: int
    class Config: from_attributes = True

class UserBase(BaseModel):
    username: str
    email: EmailStr
class UserCreate(UserBase):
    password: str
class User(UserBase):
    id: int
    class Config: from_attributes = True
class Token(BaseModel):
    access_token: str
    token_type: str
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt

import crud, models, schemas, auth_utils
from database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Cấu hình đường dẫn để lấy Token (dùng cho Swagger UI và bảo mật)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- HÀM BỔ TRỢ: LẤY USER HIỆN TẠI TỪ TOKEN ---
# Hàm này sẽ được dùng làm "Dependency" cho các API cần bảo mật (như upload ảnh)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin người dùng",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Giải mã Token để lấy username
        payload = jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user


# --- API ĐĂNG KÝ ---
@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Kiểm tra username đã tồn tại chưa
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Tên đăng nhập đã tồn tại")
    
    # 2. Kiểm tra email đã tồn tại chưa
    db_email = crud.get_user_by_email(db, email=user.email)
    if db_email:
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")
    
    # 3. Mã hóa mật khẩu và lưu vào DB
    hashed_password = auth_utils.get_password_hash(user.password)
    return crud.create_user(db=db, user=user, hashed_password=hashed_password)


# --- API ĐĂNG NHẬP ---
@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Tìm user theo username
    user = crud.get_user_by_username(db, username=form_data.username)
    
    # 2. Kiểm tra user tồn tại và mật khẩu có khớp không
    if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không chính xác",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Tạo JWT Token và trả về cho Frontend
    access_token = auth_utils.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Đường dẫn tới file database SQLite (file gallery.db sẽ tự động được tạo ra sau này)
SQLALCHEMY_DATABASE_URL = "sqlite:///./gallery.db"

# Tạo engine kết nối. 
# Lưu ý: connect_args={"check_same_thread": False} là bắt buộc khi dùng SQLite với FastAPI để tránh lỗi đa luồng.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Tạo session (phiên làm việc) để tương tác với database (thêm, sửa, xóa, đọc dữ liệu)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class để các models (các bảng dữ liệu) kế thừa
Base = declarative_base()

# Hàm Dependency để cấp phát database session cho mỗi API request
# Khi API chạy xong, nó sẽ tự động đóng kết nối (db.close()) để giải phóng tài nguyên
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
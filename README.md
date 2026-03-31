# 📸 Advanced Gallery App (FastAPI + ReactJS)

Ứng dụng quản lý ảnh cá nhân với đầy đủ tính năng hiện đại.

## ✨ Tính năng nổi bật:
- **Công nghệ:** FastAPI (Backend), ReactJS + Tailwind CSS v4 (Frontend), SQLite (Database).
- **Xác thực:** Bảo mật bằng JWT Token.
- **Quản lý:** Tạo Album, phân loại ảnh, tìm kiếm thông minh.
- **Xử lý ảnh:** Tự động nén ảnh bằng Pillow, trích xuất Metadata (EXIF).
- **Tương tác:** Thả tim ảnh yêu thích, tải ảnh gốc về máy.
- **Chia sẻ:** Tạo link chia sẻ công khai cho người không có tài khoản.
- **UI/UX:** Giao diện Masonry Grid, Dark Mode, Skeleton Loading, Kéo thả file.

## 🚀 Cách chạy ứng dụng:
1. **Backend:** 
   - `cd backend`
   - `pip install -r requirements.txt`
   - `uvicorn main:app --reload`
2. **Frontend:**
   - `cd frontend`
   - `npm install`
   - `npm run dev`

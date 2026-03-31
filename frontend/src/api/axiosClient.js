import axios from 'axios';

const axiosClient = axios.create({
  baseURL:  'http://127.0.0.1:8000',
});

// INTERCEPTOR GỬI ĐI: Tự động đính kèm Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    // Đảm bảo token tồn tại và không bị lỗi chuỗi 'undefined'
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR NHẬN VỀ: Xử lý lỗi 401 tập trung
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Chỉ lấy phần data
  },
  (error) => {
    // Nếu Backend báo lỗi 401 (Token hết hạn hoặc sai)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token'); // Xóa token lỗi
      window.location.href = '/login'; // Ép quay về trang đăng nhập
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
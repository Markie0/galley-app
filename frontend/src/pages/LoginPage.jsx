import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';
import toast from 'react-hot-toast'; // Import Toast

export default function LoginPage() {
  const[formData, setFormData] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Đang đăng nhập...'); // Hiện loading

    try {
      const response = await authApi.login(formData);
      if (response && response.access_token) {
        login(response.access_token);
        toast.success('Đăng nhập thành công!', { id: toastId }); // Đổi thành success
        navigate('/');
      } else {
        toast.error('Lỗi: Không nhận được Token', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Sai thông tin đăng nhập', { id: toastId });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Đăng nhập</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input
              type="text" required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password" required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button type="submit" className="w-full py-3 mt-4 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Đăng nhập
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="font-medium text-blue-600 hover:underline">Đăng ký miễn phí</Link>
        </p>
      </div>
    </div>
  );
}
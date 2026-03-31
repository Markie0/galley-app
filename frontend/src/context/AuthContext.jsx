/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from 'react';

// 1. Khởi tạo Context
const AuthContext = createContext();

// 2. Tạo Provider
export const AuthProvider = ({ children }) => {
  // Khởi tạo state trực tiếp từ localStorage
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('access_token');
    return token ? { loggedIn: true } : null;
  });

  // Hàm xử lý Đăng nhập
  const login = (token) => {
    localStorage.setItem('access_token', token);
    setUser({ loggedIn: true });
  };

  // Hàm xử lý Đăng xuất
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);
import axiosClient from "./axiosClient";

const authApi = {
  register: (data) => {
    return axiosClient.post("/auth/register", data);
  },
  
  login: (formData) => {
    // QUAN TRỌNG: Ép kiểu dữ liệu sang Form URL Encoded cho FastAPI
    const params = new URLSearchParams();
    params.append('username', formData.username);
    params.append('password', formData.password);

    return axiosClient.post("/auth/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
};

export default authApi;
import axiosClient from "./axiosClient";
const photoApi = {
  getAll: (params) => axiosClient.get("/photos/", { params }),
  getOne: (id) => axiosClient.get(`/photos/${id}`),
  upload: (formData) => axiosClient.post("/photos/", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, data) => axiosClient.put(`/photos/${id}`, data),
  delete: (id) => axiosClient.delete(`/photos/${id}`),
  toggleFavorite: (id) => axiosClient.patch(`/photos/${id}/favorite`),
  generateShareLink: (id) => axiosClient.post(`/photos/${id}/share`),
  getPublicPhoto: (uuid) => axiosClient.get(`/photos/public/${uuid}`),
};
export default photoApi;
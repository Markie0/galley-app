import axiosClient from "./axiosClient";

const albumApi = {
  getAll: () => axiosClient.get("/albums/"),
  create: (data) => axiosClient.post("/albums/", data),
  delete: (id) => axiosClient.delete(`/albums/${id}`),
};

export default albumApi;
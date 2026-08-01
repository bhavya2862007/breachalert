import api from "./client";

export const AssetAPI = {
  list() {
    return api.get("/assets");
  },

  create(email: string, label: string) {
    return api.post("/assets", {
      email,
      label,
    });
  },

  delete(id: string) {
    return api.delete(`/assets/${id}`);
  },
};
import client from "./client";

export const AssetAPI = {
  list() {
    return client.get("/assets");
  },

  create(email: string, label: string) {
    return client.post("/assets", {
      email,
      label,
    });
  },

  delete(id: string) {
    return client.delete(`/assets/${id}`);
  },

  verify(token: string) {
    return client.get(`/verify/${token}`);
  },
};
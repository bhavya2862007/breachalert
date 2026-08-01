import api from "./client";

export const ScanAPI = {
  run(id: string) {
    return api.post(`/scans/${id}`);
  },
};
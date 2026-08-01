import api from "./client";

export const HistoryAPI = {
  get(assetId: string) {
    return api.get(`/history/${assetId}`);
  },
};
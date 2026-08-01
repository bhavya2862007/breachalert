import api from "./client";

export const ReportAPI = {
  download(id: string) {
    return api.get(`/reports/${id}`, {
      responseType: "blob",
    });
  },
};
import api from "./client";

export const BreachAPI = {
  list() {
    return api.get("/breaches");
  },

  timeline() {
    return api.get("/breaches/timeline");
  },
};
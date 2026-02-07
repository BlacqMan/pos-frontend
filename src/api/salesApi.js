import api from "./axios";

export const getEndOfDaySummary = async () => {
  const res = await api.get("/admin/end-of-day");
  return res.data;
};

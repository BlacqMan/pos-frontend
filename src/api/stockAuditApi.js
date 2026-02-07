import api from "./axios";

export const getStockAuditByProduct = async (productId) => {
  const res = await api.get(`/stock-audits/${productId}`);
  return res.data;
};

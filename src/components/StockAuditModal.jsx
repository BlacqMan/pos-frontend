import { useEffect, useState } from "react";
import { getStockAuditByProduct } from "../api/stockAuditApi";

const StockAuditModal = ({ product, onClose }) => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product) return;

    const load = async () => {
      try {
        const data = await getStockAuditByProduct(product._id);
        setAudits(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [product]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 w-[800px] max-h-[80vh] overflow-y-auto rounded-lg p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">
            Stock History — {product.name}
          </h2>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading history…</p>
        ) : audits.length === 0 ? (
          <p className="text-gray-400">No stock changes recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2">Before</th>
                <th className="p-2">After</th>
                <th className="p-2 text-left">Changed By</th>
                <th className="p-2">Role</th>
                <th className="p-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => (
                <tr key={a._id} className="border-t border-gray-800">
                  <td className="p-2">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 text-center">{a.beforeQty}</td>
                  <td className="p-2 text-center">{a.afterQty}</td>
                  <td className="p-2">
                    {a.changedBy?.name || "System"}
                  </td>
                  <td className="p-2 text-center">{a.role}</td>
                  <td className="p-2">{a.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockAuditModal;

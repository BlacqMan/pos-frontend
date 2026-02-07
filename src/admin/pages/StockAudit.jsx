import { useEffect, useState } from "react";
import api from "../../api/axios";

const StockAudit = () => {
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadLogs = async () => {
      const res = await api.get("/admin/stock-audit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    };

    loadLogs();
  }, [token]);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        Stock Audit Trail
      </h1>

      <table className="w-full bg-gray-800">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-3">Product</th>
            <th className="p-3">Change</th>
            <th className="p-3">User</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td className="p-3">{log.product.name}</td>
              <td className="p-3">{log.change}</td>
              <td className="p-3">{log.user.name}</td>
              <td className="p-3 text-sm">
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockAudit;

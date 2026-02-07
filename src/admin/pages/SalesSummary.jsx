import { useEffect, useState } from "react";
import { getEndOfDaySummary } from "../../api/salesApi";

const SalesSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEndOfDaySummary();
        setSummary(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-400">Loading sales summary…</div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6 text-red-400">
        Failed to load sales summary
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        Today’s Sales Summary
      </h1>

      {/* METRICS */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Total Sales</p>
          <p className="text-2xl font-bold">
            ₵ {summary.totalSales}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Transactions</p>
          <p className="text-2xl font-bold">
            {summary.totalTransactions}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Items Sold</p>
          <p className="text-2xl font-bold">
            {summary.itemsSold}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Active Cashiers</p>
          <p className="text-2xl font-bold">
            {summary.cashiers.length}
          </p>
        </div>
      </div>

      {/* CASHIER PERFORMANCE */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3">Cashier</th>
              <th className="p-3">Sales Count</th>
              <th className="p-3">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {summary.cashiers.map((c) => (
              <tr key={c.cashierId} className="border-t border-gray-700">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.salesCount}</td>
                <td className="p-3">
                  ₵ {c.totalAmount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesSummary;

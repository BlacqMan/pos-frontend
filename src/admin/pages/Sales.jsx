import { useEffect, useState, useCallback } from "react";
import AdminPasswordModal from "../components/AdminPasswordModal";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState("");

  // Void flow state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [voidReason, setVoidReason] = useState("");

  const token = localStorage.getItem("token");

  // ===============================
  // FETCH SALES
  // ===============================
  const fetchSales = useCallback(async () => {
    try {
      setError("");

      const res = await fetch(
        "http://localhost:5000/api/admin/sales",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSales(data);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // ===============================
  // START VOID FLOW
  // ===============================
  const startVoidSale = (sale) => {
    const reason = prompt("Enter reason for voiding this sale");

    if (!reason) return;

    setSelectedSale(sale);
    setVoidReason(reason);
    setShowPasswordModal(true);
  };

  // ===============================
  // CONFIRM VOID (WITH PASSWORD)
  // ===============================
  const confirmVoidSale = async (adminPassword) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/void-sale",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            saleId: selectedSale._id,
            reason: voidReason,
            adminPassword,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Sale voided successfully");

      // Reset state
      setShowPasswordModal(false);
      setSelectedSale(null);
      setVoidReason("");

      fetchSales();
    } catch (err) {
      alert(err.message);
    }
  };

  // ===============================
  // CANCEL VOID
  // ===============================
  const cancelVoidSale = () => {
    setShowPasswordModal(false);
    setSelectedSale(null);
    setVoidReason("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales</h1>

      {error && <p className="text-red-400 mb-3">{error}</p>}

      <div className="space-y-3">
        {sales.map((sale) => (
          <div
            key={sale._id}
            className="bg-gray-800 p-4 rounded flex justify-between items-center"
          >
            <div>
              <p>
                <b>Cashier:</b> {sale.cashier?.name}
              </p>
              <p>
                <b>Total:</b> ₵ {sale.totalAmount}
              </p>
              <p className="text-sm text-gray-400">
                {new Date(sale.createdAt).toLocaleString()}
              </p>

              {sale.isVoided && (
                <p className="text-red-500 font-bold mt-1">
                  VOIDED
                </p>
              )}
            </div>

            {!sale.isVoided && (
              <button
                className="bg-red-600 px-3 py-1 rounded"
                onClick={() => startVoidSale(sale)}
              >
                Void Sale
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ADMIN PASSWORD MODAL */}
      {showPasswordModal && (
        <AdminPasswordModal
          onConfirm={confirmVoidSale}
          onCancel={cancelVoidSale}
        />
      )}
    </div>
  );
};

export default Sales;

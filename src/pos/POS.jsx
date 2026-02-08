import { useState } from "react";
import { Navigate } from "react-router-dom";
import Categories from "../components/Categories";
import ProductGrid from "../components/ProductGrid";
import Receipt from "./Receipt";
import api from "../api/axios";

/* ===============================
   PAYMENT MODAL
=============================== */
const PaymentModal = ({ total, onConfirm, onCancel }) => {
  const [method, setMethod] = useState("cash");
  const [received, setReceived] = useState("");

  const change =
    method === "cash"
      ? Math.max(0, Number(received || 0) - total)
      : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-80 text-black">
        <h2 className="text-lg font-bold mb-4">Payment</h2>

        <label className="block mb-2">Payment Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="mobile">Mobile Money</option>
        </select>

        {method === "cash" && (
          <>
            <label className="block mb-1">Amount Received</label>
            <input
              type="number"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <p className="font-semibold mb-3">
              Change: ₵ {change}
            </p>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={() =>
              onConfirm({
                method,
                received: Number(received || 0),
                change,
              })
            }
            className="flex-1 bg-green-600 text-white p-2 rounded"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 text-white p-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===============================
   POS COMPONENT
=============================== */
const POS = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token && user);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastScan, setLastScan] = useState(null);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  /* SHIFT */
  const startShift = async () => {
    await api.post("/shifts/start", {}, { headers: { Authorization: `Bearer ${token}` } });
    setShiftOpen(true);
  };

  const endShift = async () => {
    await api.post("/shifts/end", {}, { headers: { Authorization: `Bearer ${token}` } });
    setShiftOpen(false);
  };

  /* CART */
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        setLastScan({ productId: product._id, wasNewItem: false });
        return prev.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      setLastScan({ productId: product._id, wasNewItem: true });
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const undoLastScan = () => {
    if (!lastScan) return;
    setCart((prev) => {
      const item = prev.find((i) => i._id === lastScan.productId);
      if (!item) return prev;
      if (lastScan.wasNewItem) return prev.filter((i) => i._id !== item._id);
      return prev.map((i) =>
        i._id === item._id ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
    setLastScan(null);
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  /* SALE */
  const submitSale = async (payment) => {
    await api.post(
      "/sales",
      {
        products: cart.map((i) => ({
          product: i._id,
          quantity: i.quantity,
          price: i.price,
        })),
        cashier: user._id,
        paymentMethod: payment.method,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setReceiptData({
      items: cart,
      total,
      cashier: user.name,
      date: new Date().toLocaleString(),
      amountPaid: payment.received,
      change: payment.change,
      method: payment.method,
    });

    setCart([]);
    setShowPayment(false);
    setShowReceipt(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white px-6 py-3 flex justify-between shadow">
        <h1 className="text-xl font-bold">POS System</h1>
        <div className="flex gap-2">
          {!shiftOpen ? (
            <button onClick={startShift} className="btn-primary">Start Shift</button>
          ) : (
            <button onClick={endShift} className="btn-danger">End Shift</button>
          )}
        </div>
      </header>

      <main className="p-5 grid grid-cols-12 gap-5">
        <aside className="col-span-3 bg-white rounded-xl p-4 shadow">
          <Categories selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </aside>

        <section className="col-span-6 bg-white rounded-xl p-4 shadow">
          <ProductGrid categoryId={selectedCategory} onAddToCart={handleAddToCart} />
        </section>

        <aside className="col-span-3 bg-white rounded-xl p-4 shadow flex flex-col">
          <h2 className="font-bold mb-3">Cart</h2>

          {cart.map((item) => (
            <div key={item._id} className="flex justify-between mb-2">
              <span>{item.name} × {item.quantity}</span>
              <span>₵ {item.price * item.quantity}</span>
            </div>
          ))}

          {cart.length > 0 && (
            <>
              <p className="font-bold mt-4">Total ₵ {total}</p>
              <button onClick={undoLastScan} className="btn-warning mt-2">
                Undo Last Scan
              </button>
              <button
                onClick={() => setShowPayment(true)}
                className="btn-success mt-2"
              >
                Complete Sale
              </button>
            </>
          )}
        </aside>
      </main>

      {showPayment && (
        <PaymentModal
          total={total}
          onConfirm={submitSale}
          onCancel={() => setShowPayment(false)}
        />
      )}

      {showReceipt && receiptData && (
        <Receipt
          data={receiptData}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default POS;

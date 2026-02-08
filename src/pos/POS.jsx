import { useState } from "react";
import { Navigate } from "react-router-dom";
import Categories from "../components/Categories";
import ProductGrid from "../components/ProductGrid";
import api from "../api/axios";

/* ===============================
   RECEIPT COMPONENT
=============================== */
const Receipt = ({ data, onClose }) => {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 print:bg-white">
      <div className="bg-white text-slate-800 p-6 w-80 rounded-2xl shadow-xl print:shadow-none print:w-full">
        <h2 className="text-center font-bold text-lg mb-1">MY SHOP NAME</h2>
        <p className="text-center text-xs text-slate-500 mb-4">{data.date}</p>

        <p className="text-sm mb-2">
          <strong>Cashier:</strong> {data.cashier}
        </p>

        <hr className="my-3" />

        {data.items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm mb-1">
            <span>{item.name} × {item.quantity}</span>
            <span>₵ {item.price * item.quantity}</span>
          </div>
        ))}

        <hr className="my-3" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₵ {data.total}</span>
        </div>

        {data.change > 0 && (
          <div className="flex justify-between text-sm mt-2">
            <span>Change</span>
            <span>₵ {data.change}</span>
          </div>
        )}

        <div className="flex gap-2 mt-5 print:hidden">
          <button onClick={handlePrint} className="flex-1 h-11 rounded-lg bg-emerald-600 text-white">
            Print
          </button>
          <button onClick={onClose} className="flex-1 h-11 rounded-lg bg-slate-600 text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-lg font-bold mb-4">Payment</h2>

        <p className="mb-3 font-semibold">Total: ₵ {total}</p>

        <select
          className="w-full border p-2 rounded mb-3"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="momo">Mobile Money</option>
          <option value="card">Card</option>
        </select>

        {method === "cash" && (
          <>
            <input
              type="number"
              placeholder="Amount received"
              className="w-full border p-2 rounded mb-2"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
            />
            <p className="text-sm mb-3">Change: ₵ {change}</p>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onConfirm({ paymentMethod: method, change })}
            className="flex-1 bg-green-600 text-white p-2 rounded"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white p-2 rounded"
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

  const startShift = async () => {
    await api.post("/shifts/start", {}, { headers: { Authorization: `Bearer ${token}` } });
    setShiftOpen(true);
  };

  const endShift = async () => {
    await api.post("/shifts/end", {}, { headers: { Authorization: `Bearer ${token}` } });
    setShiftOpen(false);
  };

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
    setCart((prev) =>
      prev
        .map((i) =>
          i._id === lastScan.productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
    setLastScan(null);
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const confirmSale = async (payment) => {
    await api.post(
      "/sales",
      {
        products: cart.map((i) => ({
          product: i._id,
          quantity: i.quantity,
          price: i.price,
        })),
        cashier: user._id,
        paymentMethod: payment.paymentMethod,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setReceiptData({
      items: cart,
      total,
      cashier: user.name,
      date: new Date().toLocaleString(),
      change: payment.change,
    });

    setCart([]);
    setShowPayment(false);
    setShowReceipt(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white px-6 py-3 flex justify-between shadow-sm sticky top-0">
        <h1 className="text-xl font-bold">POS System</h1>

        {!shiftOpen ? (
          <button onClick={startShift} className="btn-primary">
            Start Shift
          </button>
        ) : (
          <button onClick={endShift} className="btn-danger">
            End Shift
          </button>
        )}
      </header>

      <main className="p-5 grid grid-cols-12 gap-5">
        <aside className="col-span-3 bg-white p-4 rounded shadow">
          <Categories selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </aside>

        <section className="col-span-6 bg-white p-4 rounded shadow">
          <ProductGrid categoryId={selectedCategory} onAddToCart={handleAddToCart} />
        </section>

        <aside className="col-span-3 bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Cart</h2>

          {cart.map((item) => (
            <div key={item._id} className="flex justify-between">
              <span>{item.name} × {item.quantity}</span>
              <span>₵ {item.price * item.quantity}</span>
            </div>
          ))}

          <p className="font-bold mt-4">Total ₵ {total}</p>

          <button onClick={undoLastScan} disabled={!lastScan} className="btn-warning mt-2">
            Undo Last Scan
          </button>

          <button
            onClick={() => setShowPayment(true)}
            disabled={!shiftOpen}
            className="btn-success mt-2"
          >
            Complete Sale
          </button>
        </aside>
      </main>

      {showPayment && (
        <PaymentModal
          total={total}
          onConfirm={confirmSale}
          onCancel={() => setShowPayment(false)}
        />
      )}

      {showReceipt && receiptData && (
        <Receipt data={receiptData} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
};

export default POS;

import { useState } from "react";
import { Navigate } from "react-router-dom";
import Categories from "../components/Categories";
import ProductGrid from "../components/ProductGrid";
import api from "../api/axios";

/* ===============================
   RECEIPT
=============================== */
const Receipt = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 print:bg-white">
      <div className="bg-white text-slate-900 w-80 rounded-2xl p-5 print:w-full">
        <h2 className="text-center text-xl font-bold">MY SHOP</h2>
        <p className="text-center text-xs text-slate-500 mb-4">
          {data.date}
        </p>

        <p className="text-sm mb-3">
          Cashier: <strong>{data.cashier}</strong>
        </p>

        <div className="space-y-1 text-sm">
          {data.items.map((i) => (
            <div key={i._id} className="flex justify-between">
              <span>{i.name} × {i.quantity}</span>
              <span>₵ {i.price * i.quantity}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-lg font-bold border-t mt-4 pt-3">
          <span>Total</span>
          <span>₵ {data.total}</span>
        </div>

        <div className="flex gap-2 mt-5 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 h-11 bg-emerald-600 text-white rounded-lg"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 bg-slate-600 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===============================
   POS
=============================== */
const POS = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [shiftOpen, setShiftOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token || !user) return <Navigate to="/login" replace />;

  /* ===============================
     SHIFT
  =============================== */
  const startShift = async () => {
    await api.post("/shifts/start", {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setShiftOpen(true);
  };

  const endShift = async () => {
    await api.post("/shifts/end", {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setShiftOpen(false);
  };

  /* ===============================
     CART
  =============================== */
  const add = (p) => {
    setCart((c) => {
      const e = c.find((i) => i._id === p._id);
      return e
        ? c.map((i) =>
            i._id === p._id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...c, { ...p, quantity: 1 }];
    });
  };

  const remove = (id) => {
    setCart((c) =>
      c
        .map((i) =>
          i._id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const total = cart.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  /* ===============================
     SALE
  =============================== */
  const submitSale = async () => {
    if (!shiftOpen || cart.length === 0) return;

    await api.post(
      "/sales",
      {
        products: cart.map((i) => ({
          product: i._id,
          quantity: i.quantity,
          price: i.price,
        })),
        cashier: user._id,
        paymentMethod: "cash",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setReceiptData({
      items: cart,
      total,
      cashier: user.name,
      date: new Date().toLocaleString(),
    });

    setCart([]);
    setShowReceipt(true);
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* TOP BAR */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/10">
        <div>
          <h1 className="font-bold text-lg">POS Terminal</h1>
          <p className="text-xs text-slate-400">
            Cashier: {user.name}
          </p>
        </div>

        <div className="flex gap-2">
          {!shiftOpen ? (
            <button
              onClick={startShift}
              className="px-4 h-10 rounded-lg bg-indigo-600"
            >
              Start Shift
            </button>
          ) : (
            <button
              onClick={endShift}
              className="px-4 h-10 rounded-lg bg-red-600"
            >
              End Shift
            </button>
          )}
        </div>
      </header>

      {/* BODY */}
      <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-4rem)]">
        {/* CATEGORIES */}
        <aside className="col-span-2 bg-slate-800 rounded-xl p-3">
          <Categories
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </aside>

        {/* PRODUCTS */}
        <section className="col-span-7 bg-slate-800 rounded-xl p-4 overflow-y-auto">
          <ProductGrid
            categoryId={selectedCategory}
            onAddToCart={add}
          />
        </section>

        {/* CART */}
        <aside className="col-span-3 bg-slate-800 rounded-xl p-4 flex flex-col">
          <h2 className="font-bold mb-3">Cart</h2>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {cart.map((i) => (
              <div
                key={i._id}
                className="flex justify-between items-center bg-slate-700 p-2 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-slate-400">
                    ₵ {i.price} × {i.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => remove(i._id)}
                    className="h-7 w-7 bg-slate-600 rounded"
                  >
                    −
                  </button>
                  <span>{i.quantity}</span>
                  <button
                    onClick={() => add(i)}
                    className="h-7 w-7 bg-slate-600 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="flex justify-between text-xl font-bold mb-3">
              <span>Total</span>
              <span>₵ {total}</span>
            </div>

            <button
              onClick={submitSale}
              disabled={!shiftOpen}
              className="w-full h-12 bg-emerald-600 rounded-xl disabled:opacity-50"
            >
              Complete Sale
            </button>
          </div>
        </aside>
      </div>

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

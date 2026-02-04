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
      <div className="bg-white text-slate-800 p-6 w-80 rounded-xl shadow-lg print:shadow-none print:w-full">
        <h2 className="text-center font-bold text-lg mb-1">
          MY SHOP NAME
        </h2>

        <p className="text-center text-xs text-slate-500 mb-4">
          {data.date}
        </p>

        <p className="text-sm mb-2">
          <strong>Cashier:</strong> {data.cashier}
        </p>

        <hr className="my-3" />

        {data.items.map((item) => (
          <div
            key={item._id}
            className="flex justify-between text-sm mb-1"
          >
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>
              ₵ {item.price * item.quantity}
            </span>
          </div>
        ))}

        <hr className="my-3" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₵ {data.total}</span>
        </div>

        <p className="text-center text-xs mt-4">
          Thank you for your purchase!
        </p>

        <div className="flex gap-2 mt-5 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 h-11 rounded-lg bg-emerald-600 text-white font-medium"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-lg bg-slate-600 text-white font-medium"
          >
            Close
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [shiftOpen, setShiftOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  /* ===============================
     AUTH GUARD
  =============================== */
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  /* ===============================
     SHIFT CONTROLS
  =============================== */
  const startShift = async () => {
    try {
      await api.post(
        "/shifts/start",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShiftOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start shift");
    }
  };

  const endShift = async () => {
    try {
      await api.post(
        "/shifts/end",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShiftOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to end shift");
    }
  };

  /* ===============================
     LOGOUT
  =============================== */
  const handleLogout = () => {
    if (shiftOpen) {
      const confirmLogout = window.confirm(
        "You still have an active shift. Are you sure you want to logout?"
      );
      if (!confirmLogout) return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  /* ===============================
     CART LOGIC
  =============================== */
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i._id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const handleDeleteFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i._id !== id));
  };

  const handleClearCart = () => setCart([]);

  const total = cart.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  /* ===============================
     SUBMIT SALE
  =============================== */
  const submitSale = async () => {
    if (!shiftOpen) {
      alert("Start shift before selling");
      return;
    }

    if (cart.length === 0) return;

    try {
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

      setShowReceipt(true);
      setCart([]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete sale");
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">POS System</h1>
          <p className="text-sm text-slate-500">
            Cashier: <span className="font-medium">{user.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!shiftOpen ? (
            <button
              onClick={startShift}
              className="h-11 px-6 rounded-xl bg-indigo-600 text-white font-semibold"
            >
              Start Shift
            </button>
          ) : (
            <button
              onClick={endShift}
              className="h-11 px-6 rounded-xl bg-red-600 text-white font-semibold"
            >
              End Shift
            </button>
          )}

          <button
            onClick={handleLogout}
            className="h-11 px-5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-6 grid grid-cols-12 gap-6">
        {/* CATEGORIES */}
        <aside className="col-span-12 md:col-span-3 bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-500 mb-3">
            Categories
          </h2>
          <Categories
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </aside>

        {/* PRODUCTS */}
        <section className="col-span-12 md:col-span-6 bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-500 mb-3">
            Products
          </h2>

          {selectedCategory ? (
            <ProductGrid
              categoryId={selectedCategory}
              onAddToCart={handleAddToCart}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Select a category to view products
            </div>
          )}
        </section>

        {/* CART */}
        <aside className="col-span-12 md:col-span-3 bg-white rounded-xl shadow-lg p-4 flex flex-col sticky top-6 h-[calc(100vh-7rem)]">
          <h2 className="text-lg font-bold mb-4">Cart</h2>

          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <p className="text-slate-400 text-sm text-center mt-10">
                Cart is empty
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center bg-slate-50 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      ₵ {item.price} × {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemoveFromCart(item._id)}
                      className="h-8 w-8 rounded-md bg-slate-200"
                    >
                      −
                    </button>

                    <span className="w-6 text-center font-medium">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className="h-8 w-8 rounded-md bg-slate-200"
                    >
                      +
                    </button>

                    <button
                      onClick={() => handleDeleteFromCart(item._id)}
                      className="text-xs text-red-500 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
              <div className="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span>₵ {total}</span>
              </div>

              <button
                onClick={submitSale}
                disabled={!shiftOpen}
                className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50"
              >
                Complete Sale
              </button>

              <button
                onClick={handleClearCart}
                className="w-full h-11 rounded-xl bg-slate-200 text-slate-700 font-medium"
              >
                Clear Cart
              </button>
            </div>
          )}
        </aside>
      </main>

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

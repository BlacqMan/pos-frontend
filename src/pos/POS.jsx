import { useEffect, useState } from "react";
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

        {data.amountPaid && (
          <>
            <div className="flex justify-between text-sm mt-2">
              <span>Paid</span>
              <span>₵ {data.amountPaid}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Change</span>
              <span>₵ {data.change}</span>
            </div>
          </>
        )}

        <div className="flex gap-2 mt-5 print:hidden">
          <button onClick={handlePrint} className="flex-1 h-11 rounded-lg bg-emerald-600 text-white font-medium">
            Print
          </button>
          <button onClick={onClose} className="flex-1 h-11 rounded-lg bg-slate-600 text-white font-medium">
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
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token && user);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastScan, setLastScan] = useState(null);

  /* AUTO CHECK ACTIVE SHIFT */
  useEffect(() => {
    const checkShift = async () => {
      try {
        const res = await api.get("/shifts/active", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.active) setShiftOpen(true);
      }catch (err) {
  console.error("Shift check failed:", err);
}

    };

    checkShift();
  }, [token]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  /* SHIFT */
  const startShift = async () => {
    try {
      await api.post("/shifts/start", {}, { headers: { Authorization: `Bearer ${token}` } });
      setShiftOpen(true);
      alert("Shift started");
    } catch (err) {
      if (err.response?.data?.message === "Shift already started") {
        setShiftOpen(true);
      } else {
        alert(err.response?.data?.message || "Failed to start shift");
      }
    }
  };

  const endShift = async () => {
    try {
      await api.post("/shifts/end", {}, { headers: { Authorization: `Bearer ${token}` } });
      setShiftOpen(false);
      alert("Shift ended");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to end shift");
    }
  };

  const handleLogout = () => {
    if (shiftOpen && !window.confirm("Shift still open. Logout anyway?")) return;
    localStorage.clear();
    window.location.href = "/login";
  };

  /* CART */
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        setLastScan({ productId: product._id });
        return prev.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      setLastScan({ productId: product._id });
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, quantity: i.quantity - 1 } : i
      ).filter((i) => i.quantity > 0)
    );
  };

  const handleDeleteFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i._id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
    setLastScan(null);
  };

  const undoLastScan = () => {
    if (!lastScan) return;
    setCart((prev) =>
      prev.map((i) =>
        i._id === lastScan.productId ? { ...i, quantity: i.quantity - 1 } : i
      ).filter((i) => i.quantity > 0)
    );
    setLastScan(null);
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  /* SALE */
  const submitSale = async () => {
    if (!shiftOpen) return alert("Start shift first");
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
        amountPaid: total,
        change: 0,
      });

      setCart([]);
      setLastScan(null);
      setShowReceipt(true);
    } catch (err) {
      alert(err.response?.data?.message || "Sale failed");
    }
  };

  /* UI */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white px-6 py-3 flex justify-between shadow-sm sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-bold">POS System</h1>
          <p className="text-xs text-slate-500">Cashier: {user.name}</p>
        </div>

        <div className="flex gap-2">
          {!shiftOpen ? (
            <button onClick={startShift} className="btn-primary">Start Shift</button>
          ) : (
            <button onClick={endShift} className="btn-danger">End Shift</button>
          )}
          <button onClick={handleLogout} className="btn-outline">Logout</button>
        </div>
      </header>

      <main className="p-5 grid grid-cols-12 gap-5">
        <aside className="col-span-3 bg-white rounded-xl p-4 shadow">
          <Categories selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory}/>
        </aside>

        <section className="col-span-6 bg-white rounded-xl p-4 shadow">
          <ProductGrid categoryId={selectedCategory} onAddToCart={handleAddToCart}/>
        </section>

        <aside className="col-span-3 bg-white rounded-xl p-4 shadow flex flex-col">
          <h2 className="font-bold mb-3">Cart</h2>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between">
                <div>
                  <p>{item.name}</p>
                  <p className="text-xs text-gray-500">₵ {item.price} × {item.quantity}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleRemoveFromCart(item._id)}>−</button>
                  <button onClick={() => handleAddToCart(item)}>+</button>
                  <button className="text-red-500" onClick={() => handleDeleteFromCart(item._id)}>x</button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <>
              <p className="font-bold mt-4">Total ₵ {total}</p>

              <button onClick={undoLastScan} disabled={!lastScan} className="btn-warning mt-2">
                Undo Last Scan
              </button>

              <button onClick={submitSale} disabled={!shiftOpen} className="btn-success mt-2">
                Complete Sale
              </button>

              <button onClick={handleClearCart} className="btn-outline mt-1">
                Clear Cart
              </button>
            </>
          )}
        </aside>
      </main>

      {showReceipt && receiptData && (
        <Receipt data={receiptData} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
};

export default POS;

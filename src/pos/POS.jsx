import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import Categories from "../components/Categories";
import ProductGrid from "../components/ProductGrid";
import Receipt from "./Receipt";
import PaymentModal from "../components/PaymentModal";
import api from "../api/axios";

const POS = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token && user);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);

  /* SHIFT */
  const [shiftOpen, setShiftOpen] = useState(false);

  /* PAYMENT */
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  /* RECEIPT */
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  /* BARCODE */
  const barcodeRef = useRef(null);
  const [barcode, setBarcode] = useState("");

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  useEffect(() => {
    barcodeRef.current?.focus();

    const checkShift = async () => {
      const res = await api.get("/shifts/active");
      if (res.data.active) setShiftOpen(true);
    };
    checkShift();
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  /* SHIFT ACTIONS */
  const startShift = async () => {
    await api.post("/shifts/start");
    setShiftOpen(true);
    alert("Shift started");
  };

  const endShift = async () => {
    await api.post("/shifts/end");
    setShiftOpen(false);
    alert("Shift ended");
  };

  /* BARCODE SCAN */
  const handleBarcodeScan = async (e) => {
    if (e.key !== "Enter") return;

    try {
      const res = await api.get(`/products/barcode/${barcode}`);
      handleAddToCart(res.data);
      setBarcode("");
    } catch {
      alert("Product not found");
    }
  };

  /* CART */
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  /* SALE */
  const submitSale = async ({ paymentMethod, amountReceived, change }) => {
    if (!shiftOpen) return alert("Start shift first");
    if (cart.length === 0) return;

    await api.post("/sales", {
      products: cart.map((i) => ({
        product: i._id,
        quantity: i.quantity,
        price: i.price,
      })),
      cashier: user._id,
      paymentMethod,
      amountPaid: amountReceived,
      change,
    });

    setReceiptData({
      items: cart,
      total,
      amountPaid: amountReceived,
      change,
      cashier: user.name,
      date: new Date().toLocaleString(),
      method: paymentMethod,
    });

    setCart([]);
    setShowReceipt(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* HEADER */}
      <header className="bg-white px-6 py-3 flex justify-between shadow">
        <div>
          <h1 className="text-xl font-bold">POS System</h1>
          <p className="text-xs text-gray-500">Cashier: {user.name}</p>
        </div>

        <div className="flex gap-2">
          {!shiftOpen ? (
            <button onClick={startShift} className="bg-green-600 text-white px-4 py-2 rounded">
              Start Shift
            </button>
          ) : (
            <button onClick={endShift} className="bg-red-600 text-white px-4 py-2 rounded">
              End Shift
            </button>
          )}
        </div>
      </header>

      <main className="p-5 grid grid-cols-12 gap-5">
        <aside className="col-span-3">
          <Categories selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory}/>
        </aside>

        <section className="col-span-6">
          <input
            ref={barcodeRef}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleBarcodeScan}
            placeholder="Scan barcode..."
            className="w-full border p-2 rounded mb-3"
          />

          <ProductGrid categoryId={selectedCategory} onAddToCart={handleAddToCart}/>
        </section>

        <aside className="col-span-3">
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between">
              <span>{item.name} × {item.quantity}</span>
              <span>₵ {item.price * item.quantity}</span>
            </div>
          ))}

          {cart.length > 0 && (
            <>
              <p className="font-bold mt-3">Total ₵ {total}</p>

              <button
                disabled={!shiftOpen}
                onClick={() => setShowPaymentModal(true)}
                className={`w-full h-10 mt-2 rounded text-white ${
                  shiftOpen ? "bg-green-600" : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Complete Sale
              </button>
            </>
          )}
        </aside>
      </main>

      {showPaymentModal && (
        <PaymentModal
          total={total}
          onConfirm={(data) => {
            setShowPaymentModal(false);
            submitSale(data);
          }}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}

      {showReceipt && receiptData && (
        <Receipt data={receiptData} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
};

export default POS;

import { useEffect, useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Categories from "../components/Categories";
import ProductGrid from "../components/ProductGrid";
import Receipt from "./Receipt";
import PaymentModel from "../components/PaymentModel";
import api from "../api/axios";

const POS = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token && user);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [shiftOpen, setShiftOpen] = useState(false);

  const [showPaymentModel, setShowPaymentModel] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [countedCash, setCountedCash] = useState("");
  const [countedMoMo, setCountedMoMo] = useState("");
  const [countedCard, setCountedCard] = useState("");

  const barcodeRef = useRef(null);
  const [barcode, setBarcode] = useState("");

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  useEffect(() => {
    barcodeRef.current?.focus();

    const checkShift = async () => {
      try {
        const res = await api.get("/shifts/active");
        if (res.data.active) setShiftOpen(true);
      } catch (err) {
        console.error("Shift check failed", err);
      }
    };

    checkShift();
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  /* ================= SHIFT ================= */

  const startShift = async () => {
    try {
      await api.post("/shifts/start");
      setShiftOpen(true);
    } catch {
      alert("Failed to start shift");
    }
  };

  const openReconciliation = () => {
    setShowReconcileModal(true);
  };

  const confirmEndShift = async () => {
    try {
      await api.post("/shifts/end", {
        countedCash: Number(countedCash) || 0,
        countedMoMo: Number(countedMoMo) || 0,
        countedCard: Number(countedCard) || 0,
      });

      setShiftOpen(false);
      setShowReconcileModal(false);
      setCountedCash("");
      setCountedMoMo("");
      setCountedCard("");
      //alert("Shift closed successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to close shift");
    }
  };

  const handleLogout = () => {
    if (shiftOpen) {
      const confirmLogout = window.confirm(
        "Shift is still open. Logout anyway?"
      );
      if (!confirmLogout) return;
    }
    localStorage.clear();
    navigate("/login");
  };

  /* ================= BARCODE ================= */

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

  /* ================= CART ================= */

  const handleAddToCart = (product) => {
    if (product.quantity <= 0) {
      alert("Product is out of stock");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);

      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert("No more stock available");
          return prev;
        }

        return prev.map((i) =>
          i._id === product._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQty = (item) => {
    if (item.quantity >= item.quantity) return;

    setCart((prev) =>
      prev.map((i) =>
        i._id === item._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i._id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => i._id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  /* ================= SALE ================= */

  const submitSale = async ({ paymentMethod, amountReceived, change }) => {
    if (!shiftOpen) return alert("Start shift first");
    if (cart.length === 0) return;

    try {
      const response = await api.post("/sales", {
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

      const sale = response.data;

      setReceiptData({
        invoiceNumber: sale.invoiceNumber,
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
    } catch (err) {
      alert(err.response?.data?.message || "Sale failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-white px-6 py-3 flex justify-between shadow">
        <div>
          <h1 className="text-xl font-bold">POS System</h1>
          <p className="text-xs text-gray-500">
            Cashier: {user.name}
          </p>
        </div>

        <div className="flex gap-3">
          {!shiftOpen ? (
            <button
              onClick={startShift}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Start Shift
            </button>
          ) : (
            <button
              onClick={openReconciliation}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              End Shift
            </button>
          )}

          <button
            onClick={handleLogout}
            className="border px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-6">

        <aside className="col-span-3 bg-white rounded-xl p-4 shadow">
          <Categories
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </aside>

        <section className="col-span-6 bg-white rounded-xl p-4 shadow">
          <input
            ref={barcodeRef}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleBarcodeScan}
            placeholder="Scan barcode..."
            className="w-full border p-2 rounded mb-4"
          />

          <ProductGrid
            categoryId={selectedCategory}
            onAddToCart={handleAddToCart}
          />
        </section>

        <aside className="col-span-3 bg-white rounded-xl p-4 shadow flex flex-col">
          <h2 className="font-bold mb-4">Cart</h2>

          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center">
                <div>
                  <p>{item.name}</p>
                  <p className="text-sm text-gray-500">
                    ₵ {item.price} × {item.quantity}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => decreaseQty(item._id)}>−</button>
                  <button onClick={() => increaseQty(item)}>+</button>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-red-500"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <>
              <div className="mt-4 font-bold text-lg">
                Total ₵ {total}
              </div>

              <button
                onClick={() => setShowPaymentModel(true)}
                disabled={!shiftOpen}
                className="mt-3 w-full bg-black text-white py-2 rounded"
              >
                Complete Sale
              </button>

              <button
                onClick={clearCart}
                className="mt-2 w-full border py-2 rounded"
              >
                Clear Cart
              </button>
            </>
          )}
        </aside>
      </main>

      {showPaymentModel && (
        <PaymentModel
          total={total}
          onConfirm={(data) => {
            setShowPaymentModel(false);
            submitSale(data);
          }}
          onCancel={() => setShowPaymentModel(false)}
        />
      )}

      {showReceipt && receiptData && (
        <Receipt
          data={receiptData}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {showReconcileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="font-bold mb-4">Shift Reconciliation</h2>

            <input
              type="number"
              placeholder="Cash Counted"
              className="w-full border p-2 rounded mb-3"
              value={countedCash}
              onChange={(e) => setCountedCash(e.target.value)}
            />

            <input
              type="number"
              placeholder="MoMo Total"
              className="w-full border p-2 rounded mb-3"
              value={countedMoMo}
              onChange={(e) => setCountedMoMo(e.target.value)}
            />

            <input
              type="number"
              placeholder="Card Total"
              className="w-full border p-2 rounded mb-4"
              value={countedCard}
              onChange={(e) => setCountedCard(e.target.value)}
            />

            <div className="flex gap-2">
              <button
                onClick={confirmEndShift}
                className="flex-1 bg-green-600 text-white p-2 rounded"
              >
                Close Shift
              </button>

              <button
                onClick={() => setShowReconcileModal(false)}
                className="flex-1 bg-gray-500 text-white p-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;

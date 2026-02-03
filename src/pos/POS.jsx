import { useState } from "react";
import Categories from "../components/Categories";
import ProductGrid from "../components/ProductGrid";

// ===============================
// RECEIPT COMPONENT
// ===============================
const Receipt = ({ data, onClose }) => {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 print:bg-white">
      <div className="bg-white text-black p-6 w-80 rounded shadow-lg print:shadow-none print:w-full">
        <h2 className="text-center font-bold text-lg mb-2">
          MY SHOP NAME
        </h2>

        <p className="text-center text-sm mb-4">{data.date}</p>

        <p className="mb-2">
          <strong>Cashier:</strong> {data.cashier}
        </p>

        <hr className="my-2" />

        {data.items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>₵ {item.price * item.quantity}</span>
          </div>
        ))}

        <hr className="my-2" />

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>₵ {data.total}</span>
        </div>

        <p className="text-center text-xs mt-4">
          Thank you for your purchase!
        </p>

        <div className="flex gap-2 mt-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-green-600 text-white p-2 rounded"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white p-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const POS = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);

  // RECEIPT STATE
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // SHIFT STATE
  const [shiftOpen, setShiftOpen] = useState(false);

  // AUTH
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ===============================
  // AUTH LOCK
  // ===============================
  if (!token || !user) {
    window.location.href = "/login";
    return null;
  }

  // ===============================
  // SHIFT CONTROLS
  // ===============================
  const startShift = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/shifts/start", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setShiftOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const endShift = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/shifts/end", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setShiftOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // ===============================
  // CART LOGIC
  // ===============================
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

  // ===============================
  // SUBMIT SALE
  // ===============================
  const submitSale = async () => {
    if (!shiftOpen) {
      alert("Start shift before selling");
      return;
    }

    if (cart.length === 0) return;

    try {
      const saleData = {
        products: cart.map((i) => ({
          product: i._id,
          quantity: i.quantity,
          price: i.price,
        })),
        cashier: user._id,
        paymentMethod: "cash",
      };

      const res = await fetch("http://localhost:5000/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(saleData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setReceiptData({
        items: cart,
        total,
        cashier: user.name,
        date: new Date().toLocaleString(),
      });

      setShowReceipt(true);
      setCart([]);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-1">POS System</h1>

      <p className="text-gray-400 mb-2">
        <b>{user.name}</b>
      </p>

      {/* SHIFT BUTTONS */}
      <div className="mb-4 flex gap-2">
        {!shiftOpen ? (
          <button
            onClick={startShift}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Start Shift
          </button>
        ) : (
          <button
            onClick={endShift}
            className="bg-red-600 px-4 py-2 rounded"
          >
            End Shift
          </button>
        )}
      </div>

      <div className="flex gap-6">
        <div className="w-1/4">
          <Categories
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="flex-1 overflow-y-auto max-h-[75vh]">
          {selectedCategory ? (
            <ProductGrid
              categoryId={selectedCategory}
              onAddToCart={handleAddToCart}
            />
          ) : (
            <p className="text-gray-400">
              Select a category to see products.
            </p>
          )}
        </div>

        <div className="w-1/4 bg-gray-800 p-4 rounded-lg sticky top-6 h-[75vh] flex flex-col">
          <h2 className="text-xl font-bold mb-4">Cart</h2>

          {cart.length === 0 ? (
            <p className="text-gray-400">No products in cart.</p>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center p-2 bg-gray-700 rounded"
                >
                  <div>
                    {item.name} × {item.quantity}
                  </div>
                  <div className="flex gap-1 items-center">
                    <span>₵ {item.price * item.quantity}</span>
                    <button
                      className="bg-red-600 px-2 rounded"
                      onClick={() => handleRemoveFromCart(item._id)}
                    >
                      -
                    </button>
                    <button
                      className="bg-gray-600 px-2 rounded"
                      onClick={() => handleDeleteFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="mt-4 border-t border-gray-700 pt-2 space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₵ {total}</span>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 bg-green-600 p-2 rounded disabled:bg-gray-500"
                  onClick={submitSale}
                  disabled={!shiftOpen}
                >
                  Complete Sale
                </button>
                <button
                  className="flex-1 bg-red-600 p-2 rounded"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
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

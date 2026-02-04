import { useEffect, useState } from "react";
import api from "../api/axios";

const ProductGrid = ({ categoryId, onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/products", {
          params: { category: categoryId },
        });

        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  /* ===============================
     LOADING STATE (SKELETONS)
  =============================== */
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 bg-slate-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  /* ===============================
     EMPTY STATE
  =============================== */
  if (!products || products.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        No products in this category
      </div>
    );
  }

  /* ===============================
     PRODUCT GRID
  =============================== */
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => {
        const outOfStock = product.quantity <= 0;
        const lowStock = product.quantity > 0 && product.quantity <= 5;

        return (
          <button
            key={product._id}
            disabled={outOfStock}
            onClick={() => onAddToCart(product)}
            className={`relative text-left rounded-xl p-4 shadow-sm border transition active:scale-[0.98]
              ${
                outOfStock
                  ? "bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed"
                  : "bg-white border-slate-200 hover:shadow-md"
              }`}
          >
            {/* STOCK BADGE */}
            <div className="absolute top-2 right-2">
              {outOfStock && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-medium">
                  Out
                </span>
              )}
              {lowStock && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-600 font-medium">
                  Low
                </span>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-800 leading-tight">
                {product.name}
              </h3>

              <p className="text-sm text-slate-500">
                ₵ {product.price}
              </p>
            </div>

            {/* FOOTER */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Stock: {product.quantity}
              </span>

              {!outOfStock && (
                <span className="text-xs font-medium text-indigo-600">
                  Tap to add
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ProductGrid;

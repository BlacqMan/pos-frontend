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

  if (loading) {
    return (
      <p className="text-gray-400">
        Loading products...
      </p>
    );
  }

  if (!products || products.length === 0) {
    return (
      <p className="text-gray-400">
        No products found in this category.
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition flex flex-col justify-between"
          >
            <div>
              <h3 className="text-white font-semibold">
                {product.name}
              </h3>
              <p className="text-gray-400">
                ₵ {product.price}
              </p>
              <p className="text-gray-400">
                Stock: {product.quantity}
              </p>
            </div>

            <button
              className="mt-2 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;

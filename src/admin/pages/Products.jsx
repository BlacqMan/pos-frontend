import { useEffect, useState } from "react";
import api from "../../api/axios";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  /* ===============================
     LOAD PRODUCTS + CATEGORIES
  =============================== */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProducts(
          Array.isArray(productsRes.data)
            ? productsRes.data
            : []
        );
        setCategories(
          Array.isArray(categoriesRes.data)
            ? categoriesRes.data
            : []
        );
      } catch {
        setError("Failed to load products or categories");
      }
    };

    loadData();
  }, [token]);

  /* ===============================
     CREATE PRODUCT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !price ||
      !quantity ||
      !category
    ) {
      alert("All fields except barcode are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/products",
        {
          name: name.trim(),
          price: Number(price),
          quantity: Number(quantity),
          barcode: barcode.trim(),
          category, // ✅ ObjectId
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts((prev) => [...prev, res.data]);

      // Reset form
      setName("");
      setPrice("");
      setQuantity("");
      setBarcode("");
      setCategory("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save product"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     DELETE PRODUCT
  =============================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?"))
      return;

    try {
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prev) =>
        prev.filter((p) => p._id !== id)
      );
    } catch {
      alert("Failed to delete product");
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        Admin Products
      </h1>

      {error && (
        <p className="text-red-400 mb-4">{error}</p>
      )}

      {/* ADD PRODUCT FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-4 rounded-lg mb-8 grid grid-cols-2 gap-4"
      >
        <input
          className="bg-gray-700 p-2 rounded"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          step="0.01"
          className="bg-gray-700 p-2 rounded"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="number"
          className="bg-gray-700 p-2 rounded"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <input
          className="bg-gray-700 p-2 rounded"
          placeholder="Barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />

        <select
          className="bg-gray-700 p-2 rounded col-span-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">
            Select Category
          </option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="col-span-2 bg-blue-600 p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Product"}
        </button>
      </form>

      {/* PRODUCTS TABLE */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Category</th>
              <th className="p-3 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-400"
                >
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p._id}
                  className="border-t border-gray-700"
                >
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">₵ {p.price}</td>
                  <td className="p-3">{p.quantity}</td>
                  <td className="p-3">
                    {p.category?.name || "—"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        handleDelete(p._id)
                      }
                      className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;

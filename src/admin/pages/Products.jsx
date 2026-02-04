import { useEffect, useState } from "react";
import api from "../api/axios";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("");

  const token = localStorage.getItem("token");

  /* ===============================
     FETCH PRODUCTS + CATEGORIES
  =============================== */
  useEffect(() => {
    const fetchData = async () => {
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
      } catch (err) {
        console.error("Fetch data error:", err);
        alert("Failed to load products or categories");
      }
    };

    fetchData();
  }, [token]);

  /* ===============================
     START EDIT
  =============================== */
  const startEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setQuantity(product.quantity);
    setBarcode(product.barcode || "");
    setCategory(product.category?._id || "");
  };

  /* ===============================
     DELETE PRODUCT
  =============================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prev) =>
        prev.filter((p) => p._id !== id)
      );
    } catch (err) {
      console.error("Delete error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  /* ===============================
     ADD / UPDATE PRODUCT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !quantity || !category) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        price: Number(price),
        quantity: Number(quantity),
        barcode,
        category,
      };

      if (editingProduct) {
        await api.put(
          `/products/${editingProduct._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await api.post("/products", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Reset form
      setName("");
      setPrice("");
      setQuantity("");
      setBarcode("");
      setCategory("");
      setEditingProduct(null);

      // Refresh products
      const res = await api.get("/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(
        Array.isArray(res.data) ? res.data : []
      );
    } catch (err) {
      console.error("Save product error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to save product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">
        Admin Products
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded bg-gray-800"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="p-2 rounded bg-gray-800"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="p-2 rounded bg-gray-800"
        />
        <input
          type="text"
          placeholder="Barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="p-2 rounded bg-gray-800"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 rounded bg-gray-800"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 py-2 rounded hover:bg-blue-700 disabled:opacity-50 md:col-span-2"
        >
          {loading
            ? "Saving..."
            : editingProduct
            ? "Update Product"
            : "Add Product"}
        </button>
      </form>

      {/* PRODUCTS TABLE */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-3">Name</th>
            <th className="p-3">Price</th>
            <th className="p-3">Quantity</th>
            <th className="p-3">Category</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr
              key={prod._id}
              className="border-b border-gray-700"
            >
              <td className="p-3">{prod.name}</td>
              <td className="p-3">
                ₵ {prod.price}
              </td>
              <td className="p-3">
                {prod.quantity}
              </td>
              <td className="p-3">
                {prod.category?.name || "—"}
              </td>
              <td className="p-3 flex gap-2">
                <button
                  onClick={() => startEdit(prod)}
                  className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    handleDelete(prod._id)
                  }
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;

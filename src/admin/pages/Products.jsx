import { useEffect, useState } from "react";

const PRODUCTS_URL = "http://localhost:5000/api/products";
const CATEGORIES_URL = "http://localhost:5000/api/categories";

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

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await fetch(PRODUCTS_URL);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORIES_URL);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Start editing a product
  const startEdit = (product) => {
    setEditingProduct({
      ...product,
      category: product.category?._id || "",
    });
    setName(product.name);
    setPrice(product.price);
    setQuantity(product.quantity);
    setBarcode(product.barcode || "");
    setCategory(product.category?._id || "");
  };

  // Delete a product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${PRODUCTS_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message);
    }
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !quantity || !category) {
      return alert("Please fill all required fields");
    }

    setLoading(true);

    try {
      const url = editingProduct
        ? `${PRODUCTS_URL}/${editingProduct._id}`
        : PRODUCTS_URL;

      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          quantity: Number(quantity),
          barcode,
          category,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save product");
      }

      // Reset form
      setName("");
      setPrice("");
      setQuantity("");
      setBarcode("");
      setCategory("");
      setEditingProduct(null);

      fetchProducts();
    } catch (error) {
      console.error("Save product error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Products</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
          {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* Products Table */}
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
            <tr key={prod._id} className="border-b border-gray-700">
              <td className="p-3">{prod.name}</td>
              <td className="p-3">₵ {prod.price}</td>
              <td className="p-3">{prod.quantity}</td>
              <td className="p-3">{prod.category?.name}</td>
              <td className="p-3 flex gap-2">
                <button
                  onClick={() => startEdit(prod)}
                  className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(prod._id)}
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

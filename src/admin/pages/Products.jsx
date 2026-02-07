import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Papa from "papaparse";
import StockAuditModal from "../../components/StockAuditModal";

const LOW_STOCK_LIMIT = 10;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [auditProduct, setAuditProduct] = useState(null);

  // form fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const navigate = useNavigate();

  const canEdit = role === "admin" || role === "super_admin";
  const canDelete = role === "super_admin";

  /* ===============================
     LOAD PRODUCTS + CATEGORIES
  =============================== */
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

      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch {
      setError("Failed to load products or categories");
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  /* ===============================
     SELECTION (BARCODE PRINTING)
  =============================== */
  const toggleSelect = (product) => {
    setSelectedProducts((prev) =>
      prev.find((p) => p._id === product._id)
        ? prev.filter((p) => p._id !== product._id)
        : [...prev, product]
    );
  };

  const handlePrintBarcodes = () => {
    if (selectedProducts.length === 0) {
      alert("Select at least one product to print barcodes");
      return;
    }

    navigate("/admin/print-barcodes", {
      state: { products: selectedProducts },
    });
  };

  /* ===============================
     START EDIT
  =============================== */
  const startEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku || "");
    setPrice(product.price);
    setQuantity(product.quantity);
    setCategory(product.category?._id || "");
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setSku("");
    setPrice("");
    setQuantity("");
    setCategory("");
  };

  /* ===============================
     CREATE / UPDATE PRODUCT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canEdit) return alert("Permission denied");

    if (!name || !price || !quantity || !category) {
      return alert("All fields except SKU are required");
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim() || undefined,
        price: Number(price),
        quantity: Number(quantity),
        category,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/products", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     DELETE PRODUCT
  =============================== */
  const handleDelete = async (id) => {
    if (!canDelete) return alert("Only super admins can delete products");

    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete product");
    }
  };

  /* ===============================
     BULK CSV IMPORT
  =============================== */
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          for (const row of results.data) {
            if (
              !row.name ||
              !row.price ||
              !row.quantity ||
              !row.categoryName
            ) {
              continue;
            }

            const matchedCategory = categories.find(
              (c) =>
                c.name.toLowerCase() === row.categoryName.toLowerCase()
            );

            if (!matchedCategory) continue;

            await api.post(
              "/products",
              {
                name: row.name.trim(),
                sku: row.sku?.trim() || undefined,
                price: Number(row.price),
                quantity: Number(row.quantity),
                category: matchedCategory._id,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          }

          alert("✅ Bulk import completed");
          loadData();
        } catch {
          alert("❌ Bulk import failed");
        } finally {
          e.target.value = "";
        }
      },
    });
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Products</h1>

        {canEdit && (
          <button
            onClick={handlePrintBarcodes}
            className="bg-black px-4 py-2 rounded hover:bg-gray-900"
          >
            Print Barcodes
          </button>
        )}
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* CSV IMPORT */}
      {canEdit && (
        <div className="mb-6">
          <label className="block text-sm mb-1 text-gray-300">
            Bulk Import (CSV)
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="text-sm"
          />
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {canEdit && (
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
            className="bg-gray-700 p-2 rounded"
            placeholder="SKU (optional)"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
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

          <select
            className="bg-gray-700 p-2 rounded col-span-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            className="col-span-2 bg-blue-600 p-2 rounded hover:bg-blue-700"
          >
            {loading
              ? "Saving..."
              : editingProduct
              ? "Update Product"
              : "Add Product"}
          </button>
        </form>
      )}

      {/* PRODUCTS TABLE */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3"></th>
              <th className="p-3">Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Barcode</th>
              <th className="p-3">Price</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Category</th>
              <th className="p-3 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p._id}
                className={`border-t border-gray-700 ${
                  p.quantity <= LOW_STOCK_LIMIT ? "bg-red-900/30" : ""
                }`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={!!selectedProducts.find((s) => s._id === p._id)}
                    onChange={() => toggleSelect(p)}
                  />
                </td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.sku || "—"}</td>
                <td className="p-3 text-xs text-gray-400">{p.barcode}</td>
                <td className="p-3">₵ {p.price}</td>
                <td className="p-3">{p.quantity}</td>
                <td className="p-3">{p.category?.name || "—"}</td>
                <td className="p-3 flex gap-2">
                  {canEdit && (
                    <button
                      onClick={() => startEdit(p)}
                      className="bg-yellow-600 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => setAuditProduct(p)}
                      className="bg-gray-600 px-3 py-1 rounded hover:bg-gray-700"
                    >
                      History
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-600 px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {auditProduct && (
        <StockAuditModal
          product={auditProduct}
          onClose={() => setAuditProduct(null)}
        />
      )}
    </div>
  );
};

export default Products;

import { useEffect, useState } from "react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5000/api/categories";

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Fetch categories error:", error);
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Category name is required");

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        throw new Error("Failed to create category");
      }

      setName("");
      setDescription("");
      fetchCategories();
    } catch (error) {
      console.error("Create category error:", error);
      alert("Error creating category");
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete category");
      }

      fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);
      alert("Error deleting category");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

      {/* Create Category */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-4 rounded-lg mb-6"
      >
        <h2 className="font-semibold mb-3">Add New Category</h2>

        <input
          type="text"
          placeholder="Category name"
          className="w-full mb-3 p-2 rounded bg-gray-700 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Description (optional)"
          className="w-full mb-3 p-2 rounded bg-gray-700 outline-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Category"}
        </button>
      </form>

      {/* Categories List */}
      <div className="bg-gray-800 rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
              <th className="p-3 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-gray-400 text-center">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="border-t border-gray-700 hover:bg-gray-700"
                >
                  <td className="p-3">{cat.name}</td>
                  <td className="p-3 text-gray-400">
                    {cat.description || "—"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(cat._id)}
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

export default Categories;

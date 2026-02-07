import { useEffect, useState } from "react";
import api from "../../api/axios";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // EDIT STATE
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const token = localStorage.getItem("token");

  /* ===============================
     FETCH CATEGORIES
  =============================== */
  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setError("");

        const res = await api.get("/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted) {
          setCategories(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load categories");
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [token]);

  /* ===============================
     CREATE CATEGORY
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(
        "/categories",
        { name, description },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setName("");
      setDescription("");

      const res = await api.get("/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error creating category");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     START EDIT
  =============================== */
  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
  };

  /* ===============================
     CANCEL EDIT
  =============================== */
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  /* ===============================
     SAVE EDIT
  =============================== */
  const saveEdit = async (id) => {
    if (!editName.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      await api.put(
        `/categories/${id}`,
        { name: editName, description: editDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === id
            ? { ...cat, name: editName, description: editDescription }
            : cat
        )
      );

      cancelEdit();
    } catch {
      alert("Error updating category");
    }
  };

  /* ===============================
     DELETE CATEGORY
  =============================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await api.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories((prev) =>
        prev.filter((cat) => cat._id !== id)
      );
    } catch {
      alert("Error deleting category");
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        Manage Categories
      </h1>

      {error && (
        <p className="text-red-400 mb-4">{error}</p>
      )}

      {/* CREATE CATEGORY */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-4 rounded-lg mb-6"
      >
        <h2 className="font-semibold mb-3">
          Add New Category
        </h2>

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

      {/* CATEGORIES LIST */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
              <th className="p-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="p-4 text-gray-400 text-center"
                >
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="border-t border-gray-700"
                >
                  <td className="p-3">
                    {editingId === cat._id ? (
                      <input
                        className="bg-gray-700 p-2 rounded w-full"
                        value={editName}
                        onChange={(e) =>
                          setEditName(e.target.value)
                        }
                      />
                    ) : (
                      cat.name
                    )}
                  </td>

                  <td className="p-3 text-gray-400">
                    {editingId === cat._id ? (
                      <input
                        className="bg-gray-700 p-2 rounded w-full"
                        value={editDescription}
                        onChange={(e) =>
                          setEditDescription(e.target.value)
                        }
                      />
                    ) : (
                      cat.description || "—"
                    )}
                  </td>

                  <td className="p-3 flex gap-2">
                    {editingId === cat._id ? (
                      <>
                        <button
                          onClick={() => saveEdit(cat._id)}
                          className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-600 px-3 py-1 rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(cat)}
                          className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(cat._id)
                          }
                          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </>
                    )}
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

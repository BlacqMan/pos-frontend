import { useEffect, useState } from "react";
import api from "../api/axios";

const Categories = ({ selectedCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <p className="text-gray-400">
        Loading categories...
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Categories
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category._id}
            onClick={() =>
              onSelectCategory(category._id)
            }
            className={`p-4 rounded-lg cursor-pointer transition
              ${
                selectedCategory === category._id
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
          >
            <h3 className="text-white font-semibold">
              {category.name}
            </h3>
            <p className="text-gray-400 text-sm">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;

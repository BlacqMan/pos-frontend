import { useEffect, useState } from "react";

const Categories = ({ selectedCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading categories...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Categories</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map(category => (
          <div
            key={category._id}
            onClick={() => onSelectCategory(category._id)} // ✅ call parent on click
            className={`p-4 rounded-lg cursor-pointer transition 
              ${selectedCategory === category._id ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"}`}
          >
            <h3 className="text-white font-semibold">{category.name}</h3>
            <p className="text-gray-400 text-sm">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;

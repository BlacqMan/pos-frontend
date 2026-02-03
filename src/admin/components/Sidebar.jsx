import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `block p-3 rounded transition ${
      isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const goToPOS = () => {
    navigate("/pos");
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4 flex flex-col">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">Admin Portal</h1>

      {/* NAVIGATION */}
      <nav className="space-y-2 flex-1">
        <NavLink to="/admin/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/admin/adminusers" className={linkClass}>
          Admin Users
        </NavLink>

        <NavLink to="/admin/categories" className={linkClass}>
          Categories
        </NavLink>

        <NavLink to="/admin/products" className={linkClass}>
          Products
        </NavLink>

        <NavLink to="/admin/sales" className={linkClass}>
          Sales
        </NavLink>

        <NavLink to="/admin/shift-reports" className={linkClass}>
         Shift Reports
        </NavLink>

        <NavLink to="/admin/end-of-day" className={linkClass}>
          End of Day
        </NavLink>

        <NavLink to="/admin/audit-logs" className={linkClass}>
          Audit Logs
        </NavLink>


      </nav>

       


      {/* POS ACCESS */}
      <button
        onClick={goToPOS}
        className="mb-3 bg-green-600 hover:bg-green-700 p-3 rounded transition font-semibold"
      >
        Go to POS
      </button>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 p-3 rounded transition font-semibold"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;

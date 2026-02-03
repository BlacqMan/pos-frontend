// src/admin/AdminLayout.jsx
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-900 text-white p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;

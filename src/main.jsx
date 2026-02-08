import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import App from "./App";
import Login from "./pages/login";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

/* ===============================
   ADMIN LAYOUT & PAGES
=============================== */
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Categories from "./admin/pages/Categories";
import Products from "./admin/pages/Products";
import Sales from "./admin/pages/Sales";
import AdminUsers from "./admin/pages/AdminUsers";
import ShiftReports from "./admin/pages/ShiftReports";
import EndOfDay from "./admin/pages/EndOfDay";
import AuditLogs from "./admin/pages/AuditLogs";
import StockAudit from "./admin/pages/StockAudit";
import PrintBarcodes from "./admin/pages/PrintBarcodes";
import SalesSummary from "./admin/pages/SalesSummary";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* UNAUTHORIZED */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* POS (ANY AUTHENTICATED USER) */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />

        {/* ADMIN PORTAL */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* ADMIN + SUPER ADMIN */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="adminusers" element={<AdminUsers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="sales" element={<Sales />} />

          {/* NEW FEATURES */}
          <Route path="print-barcodes" element={<PrintBarcodes />} />
          <Route path="sales-summary" element={<SalesSummary />} />

          {/* REPORTS */}
          <Route path="shift-reports" element={<ShiftReports />} />
          <Route path="end-of-day" element={<EndOfDay />} />

          {/* AUDIT */}
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="stock-audit" element={<StockAudit />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

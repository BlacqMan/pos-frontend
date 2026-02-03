import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";

const EndOfDay = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");

  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const isAuthenticated = !!token && !!user;
  const isSuperAdmin = user?.role === "super_admin";

  // ===============================
  // FETCH END-OF-DAY SUMMARY
  // ===============================
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);

      const url = date
        ? `http://localhost:5000/api/admin/end-of-day?date=${date}`
        : "http://localhost:5000/api/admin/end-of-day";

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        setError("You are not authorized to view this report.");
        setSummary(null);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load end-of-day summary");
      }

      setSummary(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, date]);

  // ===============================
  // EFFECT (ALWAYS RUNS)
  // ===============================
  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      fetchSummary();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isSuperAdmin, fetchSummary]);

  // ===============================
  // REDIRECTS (AFTER HOOKS)
  // ===============================
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ===============================
  // UI STATES
  // ===============================
  if (loading) {
    return <p className="text-gray-400">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        End-of-Day Summary
      </h1>

      {error && (
        <p className="text-red-400 mb-3">
          {error}
        </p>
      )}

      <div className="mb-4">
        <label className="mr-2">Select Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-gray-700 p-2 rounded"
        />
      </div>

      {summary && (
        <div className="bg-gray-800 p-6 rounded w-96">
          <p>
            <strong>Date:</strong> {summary.date}
          </p>
          <p>
            <strong>Total Sales:</strong> {summary.totalSales}
          </p>
          <p>
            <strong>Voided Sales:</strong> {summary.totalVoids}
          </p>
          <p className="text-xl font-bold mt-2">
            Total Revenue: ₵ {summary.totalRevenue}
          </p>
        </div>
      )}
    </div>
  );
};

export default EndOfDay;

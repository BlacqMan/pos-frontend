import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../../api/axios";

const EndOfDay = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");

  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const isAuthenticated = Boolean(token && user);
  const isSuperAdmin = user?.role === "super_admin";

  /* ===============================
     FETCH END-OF-DAY SUMMARY
  =============================== */
  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      if (!isAuthenticated || !isSuperAdmin) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await api.get("/admin/end-of-day", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: date ? { date } : {},
        });

        if (isMounted) {
          setSummary(res.data);
        }
      } catch {
        if (!isMounted) return;

        setSummary(null);
        setError("Failed to load end-of-day summary");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isSuperAdmin, token, date]);

  /* ===============================
     REDIRECTS
  =============================== */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  /* ===============================
     UI STATES
  =============================== */
  if (loading) {
    return (
      <p className="text-gray-400">
        Loading...
      </p>
    );
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
        <label className="mr-2">
          Select Date:
        </label>
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

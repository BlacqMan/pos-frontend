import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";

const ShiftReports = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const isAuthenticated = !!token && !!user;
  const isSuperAdmin = user?.role === "super_admin";

  // ===============================
  // FETCH SHIFT REPORTS
  // ===============================
  const fetchShiftReports = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/admin/shift-reports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        setError("You are not authorized to view shift reports.");
        setShifts([]);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load shift reports");
      }

      setShifts(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ===============================
  // EFFECT (ALWAYS RUNS)
  // ===============================
  useEffect(() => {
    // Only fetch if fully authorized
    if (isAuthenticated && isSuperAdmin) {
      fetchShiftReports();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isSuperAdmin, fetchShiftReports]);

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
    return (
      <p className="text-gray-400">
        Loading shift reports...
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Shift Reports
      </h1>

      {error && (
        <p className="text-red-400 mb-3">
          {error}
        </p>
      )}

      {shifts.length === 0 ? (
        <p className="text-gray-400">
          No completed shifts found
        </p>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => (
            <div
              key={shift._id}
              className="bg-gray-800 p-4 rounded"
            >
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <strong>Cashier:</strong>{" "}
                  {shift.cashier?.name}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-green-400">
                    {shift.status.toUpperCase()}
                  </span>
                </p>

                <p>
                  <strong>Start:</strong>{" "}
                  {new Date(
                    shift.startTime
                  ).toLocaleString()}
                </p>

                <p>
                  <strong>End:</strong>{" "}
                  {new Date(
                    shift.endTime
                  ).toLocaleString()}
                </p>

                <p>
                  <strong>Total Sales:</strong>{" "}
                  {shift.totalSales}
                </p>

                <p>
                  <strong>Voided Sales:</strong>{" "}
                  {shift.voidedSales}
                </p>

                <p className="col-span-2">
                  <strong>Total Amount:</strong>{" "}
                  ₵ {shift.totalAmount}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShiftReports;

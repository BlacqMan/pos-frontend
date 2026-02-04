import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

const ShiftReports = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const isAuthenticated = !!token && !!user;
  const isSuperAdmin = user?.role === "super_admin";

  /* ===============================
     FETCH SHIFT REPORTS
  =============================== */
  useEffect(() => {
    if (!isAuthenticated || !isSuperAdmin) {
      setLoading(false);
      return;
    }

    const fetchShiftReports = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/admin/shift-reports", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setShifts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          setError(
            "You are not authorized to view shift reports."
          );
          setShifts([]);
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load shift reports"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShiftReports();
  }, [isAuthenticated, isSuperAdmin, token]);

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

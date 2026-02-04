import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../../api/axios";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const isAuthenticated = !!token && !!user;
  const isSuperAdmin = user?.role === "super_admin";

  /* ===============================
     FETCH AUDIT LOGS
  =============================== */
  useEffect(() => {
    if (!isAuthenticated || !isSuperAdmin) {
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/admin/audit-logs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          setError(
            "You are not authorized to view audit logs."
          );
          setLogs([]);
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load audit logs"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
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
        Loading audit logs...
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Audit Logs
      </h1>

      {error && (
        <p className="text-red-400 mb-3">
          {error}
        </p>
      )}

      {logs.length === 0 ? (
        <p className="text-gray-400">
          No audit logs found
        </p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log._id}
              className="bg-gray-800 p-3 rounded"
            >
              <p>
                <b>{log.action}</b> by{" "}
                <b>{log.performedBy?.name}</b>
              </p>

              <p className="text-gray-400 text-sm">
                {new Date(
                  log.createdAt
                ).toLocaleString()}
              </p>

              {log.details && (
                <pre className="text-xs mt-2 bg-gray-900 p-2 rounded">
                  {JSON.stringify(
                    log.details,
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;

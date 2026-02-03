import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const isAuthenticated = !!token && !!user;
  const isSuperAdmin = user?.role === "super_admin";

  // ===============================
  // FETCH AUDIT LOGS
  // ===============================
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/admin/audit-logs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        setError("You are not authorized to view audit logs.");
        setLogs([]);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load audit logs");
      }

      setLogs(data);
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
    if (isAuthenticated && isSuperAdmin) {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isSuperAdmin, fetchLogs]);

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

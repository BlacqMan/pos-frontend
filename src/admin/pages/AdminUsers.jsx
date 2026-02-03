import { useEffect, useState, useCallback } from "react";

const API_BASE = "http://localhost:5000/api";

const AdminUsers = () => {
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ===============================
     CREATE ADMIN (SUPER ADMIN ONLY)
  =============================== */
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  /* ===============================
     CREATE CASHIER
  =============================== */
  const [cashierName, setCashierName] = useState("");
  const [cashierPin, setCashierPin] = useState("");

  /* ===============================
     RESET MODAL
  =============================== */
  const [selectedUser, setSelectedUser] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [actionType, setActionType] = useState(null); // pin | password

  /* ===============================
     FETCH USERS
  =============================== */
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ===============================
     CREATE ADMIN
  =============================== */
  const createAdmin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/admin/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Admin created successfully");
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  /* ===============================
     CREATE CASHIER
  =============================== */
  const createCashier = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/admin/cashiers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cashierName,
          pinCode: cashierPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(`Cashier created. PIN: ${cashierPin}`);
      setCashierName("");
      setCashierPin("");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  /* ===============================
     RESET PIN / PASSWORD
  =============================== */
  const submitReset = async () => {
    try {
      const endpoint =
        actionType === "pin"
          ? `${API_BASE}/admin/cashiers/${selectedUser._id}/reset-pin`
          : `${API_BASE}/admin/admins/${selectedUser._id}/reset-password`;

      const body =
        actionType === "pin"
          ? { newPin: newValue }
          : { newPassword: newValue };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(
        actionType === "pin"
          ? `New PIN: ${data.newPin}`
          : "Password reset successfully"
      );

      setSelectedUser(null);
      setNewValue("");
      setActionType(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  /* ===============================
     DELETE USER
  =============================== */
  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("User deleted successfully");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {error && <p className="text-red-400 mb-2">{error}</p>}
      {success && <p className="text-green-400 mb-2">{success}</p>}

      {/* CREATE ADMIN (SUPER ADMIN ONLY) */}
      {currentUser.role === "super_admin" && (
        <div className="bg-gray-800 p-4 mb-6 rounded">
          <h2 className="font-semibold mb-2">Create Admin</h2>
          <form onSubmit={createAdmin} className="grid grid-cols-3 gap-2">
            <input
              className="p-2 bg-gray-700"
              placeholder="Name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
            <input
              className="p-2 bg-gray-700"
              placeholder="Email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <input
              type="password"
              className="p-2 bg-gray-700"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <button className="bg-blue-600 col-span-3 p-2">
              Create Admin
            </button>
          </form>
        </div>
      )}

      {/* CREATE CASHIER */}
      <div className="bg-gray-800 p-4 mb-6 rounded">
        <h2 className="font-semibold mb-2">Create Cashier</h2>
        <form onSubmit={createCashier} className="flex gap-2">
          <input
            className="p-2 bg-gray-700 flex-1"
            placeholder="Name"
            value={cashierName}
            onChange={(e) => setCashierName(e.target.value)}
          />
          <input
            className="p-2 bg-gray-700 w-24 text-center"
            placeholder="PIN"
            maxLength={4}
            value={cashierPin}
            onChange={(e) => setCashierPin(e.target.value)}
          />
          <button className="bg-green-600 px-4">Create</button>
        </form>
      </div>

      {/* USER LIST */}
      <h2 className="font-semibold mb-2">All Users</h2>

      {users.map((u) => (
        <div
          key={u._id}
          className="bg-gray-800 p-3 mb-2 flex justify-between items-center"
        >
          <span>
            {u.name} — <b>{u.role}</b>
          </span>

          <div className="flex gap-2">
            {/* CASHIER */}
            {u.role === "cashier" && (
              <>
                <button
                  className="bg-yellow-600 px-2"
                  onClick={() => {
                    setSelectedUser(u);
                    setActionType("pin");
                  }}
                >
                  Reset PIN
                </button>

                <button
                  className="bg-red-600 px-2"
                  onClick={() => deleteUser(u._id)}
                >
                  Delete
                </button>
              </>
            )}

            {/* ADMIN (SUPER ADMIN ONLY) */}
            {u.role === "admin" &&
              currentUser.role === "super_admin" && (
                <>
                  <button
                    className="bg-purple-600 px-2"
                    onClick={() => {
                      setSelectedUser(u);
                      setActionType("password");
                    }}
                  >
                    Reset Password
                  </button>

                  <button
                    className="bg-red-600 px-2"
                    onClick={() => deleteUser(u._id)}
                  >
                    Delete
                  </button>
                </>
              )}

            {/* SUPER ADMIN */}
            {u.role === "super_admin" && (
              <span className="text-gray-400 italic">
                Protected
              </span>
            )}
          </div>
        </div>
      ))}

      {/* RESET MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded w-96">
            <h3 className="font-bold mb-3">
              Reset {actionType === "pin" ? "PIN" : "Password"} for{" "}
              {selectedUser.name}
            </h3>

            <input
              className="w-full p-2 bg-gray-700 mb-3"
              type="password"
              placeholder={
                actionType === "pin" ? "New PIN" : "New Password"
              }
              onChange={(e) => setNewValue(e.target.value)}
            />

            <div className="flex gap-2">
              <button
                className="bg-green-600 flex-1 p-2"
                onClick={submitReset}
              >
                Confirm
              </button>
              <button
                className="bg-gray-600 flex-1 p-2"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

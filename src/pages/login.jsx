import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const [mode, setMode] = useState("cashier");

  // Admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Login = () => {
  const [mode, setMode] = useState("cashier");

  // Admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Cashier
  const [pinCode, setPinCode] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ===============================
     SUBMIT LOGIN
  =============================== */
  const submitLogin = async () => {
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "admin"
          ? "/auth/admin-login"
          : "/auth/cashier-login";

      const payload =
        mode === "admin"
          ? { email, password }
          : { pinCode };

      const res = await api.post(endpoint, payload);

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (["admin", "super_admin"].includes(user.role)) {
        navigate("/admin/dashboard");
      } else {
        navigate("/pos");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="bg-gray-800 p-6 rounded w-96 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === "admin"
            ? "Admin Login"
            : "Cashier Login"}
        </h2>

        {error && (
          <p className="text-red-500 mb-3 text-center">
            {error}
          </p>
        )}

        {mode === "admin" ? (
          <>
            <input
              className="w-full p-2 bg-gray-700 rounded mb-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              disabled={loading}
            />

            <input
              type="password"
              className="w-full p-2 bg-gray-700 rounded mb-4 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              disabled={loading}
            />
          </>
        ) : (
          <input
            className="w-full p-3 bg-gray-700 rounded mb-4 text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••"
            maxLength={4}
            type="password"
            value={pinCode}
            onChange={(e) =>
              setPinCode(e.target.value)
            }
            disabled={loading}
          />
        )}

        <button
          onClick={submitLogin}
          disabled={loading}
          className="w-full bg-blue-600 p-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p
          className="text-sm mt-4 text-center cursor-pointer text-blue-400 hover:underline"
          onClick={() =>
            !loading &&
            setMode(
              mode === "admin"
                ? "cashier"
                : "admin"
            )
          }
        >
          Switch to{" "}
          {mode === "admin"
            ? "Cashier"
            : "Admin"}{" "}
          Login
        </p>
      </div>
    </div>
  );
};

export default Login;


  // Cashier
  const [pinCode, setPinCode] = useState("");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submitLogin = async () => {
    setError("");

    try {
      const endpoint =
        mode === "admin"
          ? "/auth/admin-login"
          : "/auth/cashier-login";

      const payload =
        mode === "admin"
          ? { email, password }
          : { pinCode };

      const res = await api.post(endpoint, payload);

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (["admin", "super_admin"].includes(user.role)) {
        navigate("/admin/dashboard");
      } else {
        navigate("/pos");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="bg-gray-800 p-6 rounded w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === "admin" ? "Admin Login" : "Cashier Login"}
        </h2>

        {error && (
          <p className="text-red-500 mb-3">{error}</p>
        )}

        {mode === "admin" ? (
          <>
            <input
              className="w-full p-2 bg-gray-700 rounded mb-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full p-2 bg-gray-700 rounded mb-3"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </>
        ) : (
          <input
            className="w-full p-2 bg-gray-700 rounded mb-3 text-center text-2xl tracking-widest"
            placeholder="••••"
            maxLength={4}
            type="password"
            value={pinCode}
            onChange={(e) =>
              setPinCode(e.target.value)
            }
          />
        )}

        <button
          onClick={submitLogin}
          className="w-full bg-blue-600 p-2 rounded"
        >
          Login
        </button>

        <p
          className="text-sm mt-4 text-center cursor-pointer text-blue-400"
          onClick={() =>
            setMode(
              mode === "admin" ? "cashier" : "admin"
            )
          }
        >
          Switch to{" "}
          {mode === "admin" ? "Cashier" : "Admin"} Login
        </p>
      </div>
    </div>
  );
};

export default Login;

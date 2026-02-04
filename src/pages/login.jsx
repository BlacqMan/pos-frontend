import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState("cashier");

  // Admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Cashier
  const [pinCode, setPinCode] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Persist auth
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Role-based redirect
      if (user.role === "super_admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/pos");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="bg-gray-800 p-6 rounded w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === "admin" ? "Admin Login" : "Cashier Login"}
        </h2>

        {error && (
          <p className="text-red-500 mb-3 text-center">
            {error}
          </p>
        )}

        {mode === "admin" ? (
          <>
            <input
              type="email"
              className="w-full p-2 bg-gray-700 rounded mb-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />

            <input
              type="password"
              className="w-full p-2 bg-gray-700 rounded mb-3"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </>
        ) : (
          <input
            type="password"
            className="w-full p-2 bg-gray-700 rounded mb-3 text-center text-2xl tracking-widest"
            placeholder="••••"
            maxLength={4}
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            inputMode="numeric"
          />
        )}

        <button
          onClick={submitLogin}
          disabled={loading}
          className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          className="text-sm mt-4 text-center cursor-pointer text-blue-400 hover:underline"
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

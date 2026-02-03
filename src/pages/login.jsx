import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [mode, setMode] = useState("cashier");

  // Admin state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Cashier state
  const [pinCode, setPinCode] = useState("");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submitLogin = async () => {
    setError("");

    try {
      const url =
        mode === "admin"
          ? "http://localhost:5000/api/auth/admin-login"
          : "http://localhost:5000/api/auth/cashier-login";

      const body =
        mode === "admin"
          ? { email, password }
          : { pinCode };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (["admin", "super_admin"].includes(data.user.role)) {
        navigate("/admin/dashboard");
        } else {
          navigate("/pos");
        }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="bg-gray-800 p-6 rounded w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === "admin" ? "Admin Login" : "Cashier Login"}
        </h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

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
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        ) : (
          <input
            className="w-full p-2 bg-gray-700 rounded mb-3 text-center text-2xl tracking-widest"
            placeholder="••••"
            maxLength={4}
            type="password"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
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
            setMode(mode === "admin" ? "cashier" : "admin")
          }
        >
          Switch to {mode === "admin" ? "Cashier" : "Admin"} Login
        </p>
      </div>
    </div>
  );
};

export default Login;

import { useState, useContext } from "react";
import api from "../api/axios";
import UserContext from "../context/UserContext";
import { NavLink, useNavigate } from "react-router-dom";

import loginBg from "../assets/loginBg.webp";
import appLogo from "../assets/lynk-icon.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");   // <-- NEW
  const { setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // clear old errors

    if (!username || !password) {
      setError("Please enter both username and password.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/users/login", { username, password });
      const { user, token } = res.data;

      if (!user || !token) throw new Error("Invalid response from server");

      const currentUser = {
        id: user._id,
        username: user.username,
        email: user.email || "",
        token,
      };

      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      setCurrentUser(currentUser);
      navigate("/home");
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Invalid username or password.");
      } else {
        setError("Login failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative z-10 bg-white/90 p-8 rounded-2xl shadow-2xl w-md h-120 flex flex-col items-center">
        <img src={appLogo} alt="App Logo" className="w-20 h-20 mb-4" />
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome Back</h1>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Username"
            className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-md transition-all hover:bg-blue-700 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-center">
            New User?{" "}
            <NavLink
              to="/signup"
              className="text-blue-600 font-semibold hover:text-red-500"
            >
              Create One
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
}

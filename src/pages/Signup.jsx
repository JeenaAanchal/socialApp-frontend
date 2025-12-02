import { useState } from "react";
import api from "../api/axios";
import { NavLink, useNavigate } from "react-router-dom";

// Import images from src/assets
import signupBg from "../assets/loginBg.webp";
import appLogo from "../assets/lynk-icon.png";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/users/signup", form);
      const { user, token } = res.data;

      if (!user || !token) throw new Error("Signup failed");

      const currentUser = {
        id: user._id,
        username: user.username,
        email: user.email || "",
        token,
      };

      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      setLoading(false);
      navigate("/home");
    } catch (err) {
      setLoading(false);
      if (err.response) {
        console.error("Signup error:", err.response.data);
        alert(err.response.data.message || "Signup failed, check inputs.");
      } else {
        console.error("Signup error:", err.message);
        alert("Signup failed. Try again.");
      }
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${signupBg})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative z-10 bg-white/90 p-8 rounded-2xl shadow-2xl w-[28rem] h-[32rem] flex flex-col items-center">
        <img src={appLogo} alt="App Logo" className="w-20 h-20 mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Create Your Account
        </h1>

        <form onSubmit={handleSignup} className="w-full flex flex-col gap-4 mt-2">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-md transition-all hover:bg-blue-700 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-gray-700 mt-2">
            Already have an account?{" "}
            <NavLink
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Login
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
}
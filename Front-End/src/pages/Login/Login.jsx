import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/admin/login`, form,
        { withCredentials: true, });
      // console.log(res.data);
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        navigate("/");
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#27496d] to-[#f45a06] flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">

        {/* Left Side */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[#1e3a5f] text-white p-10">
          <img
            src="/logoo.webp"
            alt="Logo"
            className="h-28 mb-6"
          />

          <h1 className="text-4xl font-bold mb-3">
            Admin Panel
          </h1>

          <p className="text-center text-gray-300 max-w-sm">
            Manage Industries, Categories, Products and Suppliers
            from a single dashboard.
          </p>
        </div>

        {/* Right Side */}
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center text-[#1e3a5f] mb-2">
            Admin Login
          </h2>

          <p className="text-center text-gray-500 mb-8">
            Sign in to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail
                className="absolute left-4 top-4 text-[#1e3a5f]"
                size={20}
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full border border-gray-300 rounded-xl pl-12 p-3 outline-none focus:border-[#f45a06]"
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-4 text-[#1e3a5f]"
                size={20}
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full border border-gray-300 rounded-xl pl-12 pr-12 p-3 outline-none focus:border-[#f45a06]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-4"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#f45a06] hover:bg-[#d94d04] text-white py-3 rounded-xl font-semibold"
            >
              {loading ? "Please Wait..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
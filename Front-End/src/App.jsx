import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser, } from "./redux/slices/authSlice";
import { Toaster } from "react-hot-toast";
import api from "./utils/Api/api";
import AllRoutes from "./routes/Routes";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getMe = async () => {
      try {
        const res = await api.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/admin/me`);
        dispatch(setUser(res.data.user));
      } catch {
        dispatch(clearUser());
      }
    };

    getMe();
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <AllRoutes />
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
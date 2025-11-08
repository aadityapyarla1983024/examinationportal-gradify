//@ts-nocheck
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/homepage";
import SignUpPage from "./pages/signuppage";
import { Navbar01 } from "./components/ui/shadcn-io/navbar-01";
import SignInPage from "./pages/signinpage";
import { toast, ToastContainer } from "react-toastify";
import DashBoardRouter from "./pages/dashboardrouter";
import ExamAttemptPage from "./pages/examattemptpage";
import { useState, createContext, useEffect } from "react";
import axios from "axios";
import ForgotPasswordPage from "./pages/forgotpasswordpage";
import ResetPasswordPage from "./pages/resetpasswordpage";
import { constants } from "../config/constants.js";
const UserContext = createContext(null);
const localIp = "localhost";
const protocol = "http";

export default function App() {
  const location = useLocation();
  const [user, setUser] = useState({
    user_id: null,
    first_name: "",
    last_name: "",
    email: "",
    loggedin: false,
    token: "",
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    const apiendpoint = `${protocol}://${localIp}:3000/api/auth/login-verify`;
    axios
      .get(apiendpoint, {
        headers: {
          "x-auth-token": token,
        },
      })
      .then((res) => {
        const { user_id, first_name, last_name, email } = res.data;
        setUser({
          user_id,
          first_name,
          last_name,
          email,
          token,
          loggedin: true,
        });
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        console.error(error.response.data.error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return (
    <UserContext.Provider value={{ user, setUser, loading, setLoading, localIp, protocol }}>
      <div className="flex-col h-screen">
        {!(
          location.pathname.includes("/dashboard") || location.pathname.includes("/examattempt")
        ) && <Navbar01 />}
        <div className="flex flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/dashboard/*" element={<DashBoardRouter />} />
            <Route path="/examattempt/:excode" element={<ExamAttemptPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:jwt" element={<ResetPasswordPage />} />
          </Routes>
          <ToastContainer />
        </div>
      </div>
    </UserContext.Provider>
  );
}

export { UserContext };

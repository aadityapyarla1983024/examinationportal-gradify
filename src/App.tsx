import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/homepage";
import SignUpPage from "./pages/signuppage";
import { Navbar01 } from "./components/ui/shadcn-io/navbar-01";
import SignInPage from "./pages/signinpage";
import { ToastContainer } from "react-toastify";
import DashBoardRouter from "./pages/dashboardrouter";
export default function App() {
  const location = useLocation();
  return (
    <div className="flex-col h-screen">
      {!location.pathname.includes("/dashboard") && <Navbar01 />}
      <div className="flex flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/dashboard/*" element={<DashBoardRouter />} />
        </Routes>
        <ToastContainer />
      </div>
    </div>
  );
}

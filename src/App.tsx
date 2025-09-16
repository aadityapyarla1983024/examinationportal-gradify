import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/homepage";
import SignUpPage from "./pages/signuppage";
import { Navbar01 } from "./components/ui/shadcn-io/navbar-01";
import SignInPage from "./pages/signinpage";
import { ToastContainer } from "react-toastify";
import DashBoardPage from "./pages/dashboardpage";
export default function App() {
  return (
    <BrowserRouter>
      <div className="flex-col h-screen">
        {!window.location.pathname.includes("/dashboard") && <Navbar01 />}
        <div className="flex flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/dashboard/*" element={<DashBoardPage />} />
          </Routes>
          <ToastContainer />
        </div>
      </div>
    </BrowserRouter>
  );
}

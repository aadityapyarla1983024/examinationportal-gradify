import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/homepage";
import SignUpPage from "./pages/signuppage";
import { Navbar01 } from "./components/ui/shadcn-io/navbar-01";
import SignInPage from "./pages/signinpage";
import { ToastContainer, toast } from "react-toastify";
export default function App() {
  return (
    <BrowserRouter>
      <Navbar01 />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

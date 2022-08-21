import { Outlet, Route, Router, Routes } from "react-router-dom";
import GuestOnly from "./components/middleware/GuestOnly";
import ProtectedRoute from "./components/middleware/ProtectedRoute";
import Navbar from "./components/Navbar";
import Network from "./pages/Network";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import NotActivated from "./pages/NotActivated";
import Activated, { useActivatedContext } from "./components/context/Activated";
import LoggedRoute from "./components/middleware/LoggedRoute";
import ActivatePage from "./pages/ActivatePage";
import ForgotPassword from "./pages/ForgotPassword";
import ToastContext from "./components/context/ToastContext";
import ResetPage from "./pages/ResetPage";

const Protected = () => {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
};

const Logged = () => {
  return (
    <LoggedRoute>
      <Outlet />
    </LoggedRoute>
  );
};

const Guest = () => {
  return (
    <GuestOnly>
      <Outlet />
    </GuestOnly>
  );
};

const NavLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <div className="">
      <ToastContext>
        <Activated>
          <Routes>
            <Route path="/link/:id" element={<ActivatePage />} />
            <Route element={<Guest />}>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/forgot-password/:id" element={<ResetPage />} />
            </Route>
            <Route element={<Protected />}>
              <Route path="/not-activated" element={<NotActivated />} />
              <Route element={<Logged />}>
                <Route element={<NavLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/network" element={<Network />} />
                  <Route path="/search/:query" element={<Search />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Activated>
      </ToastContext>
    </div>
  );
}

export default App;

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

const Protected = () => {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
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
      <Routes>
        <Route element={<Guest />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<Protected />}>
          <Route path="/not-activated" element={<NotActivated />} />
          <Route element={<NavLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/network" element={<Network />} />
            <Route path="/search/:query" element={<Search />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;

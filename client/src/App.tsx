import { Outlet, Route, Router, Routes } from "react-router-dom";
import GuestOnly from "./components/middleware/GuestOnly";
import ProtectedRoute from "./components/middleware/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

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

function App() {
  return (
    <div className="">
      <Routes>
        <Route element={<Guest />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<Protected />}>
          <Route path="/home" element={<Home />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

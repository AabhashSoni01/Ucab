import { Routes, Route } from "react-router-dom";

import Login from "../pages/user/Login";
import Register from "../pages/user/Register";
import Uhome from "../pages/user/Uhome";
import Cabs from "../pages/user/Cabs";
import BookCab from "../pages/user/BookCab";
import MyBookings from "../pages/user/MyBookings";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Uhome />} />
      <Route path="/cabs" element={<Cabs />} />
      <Route path="/book/:id" element={<BookCab />} />
      <Route path="/bookings" element={<MyBookings />} />
    </Routes>
  );
}

export default AppRoutes;
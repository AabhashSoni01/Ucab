import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home       from './pages/Home';
import Login      from './pages/user/Login';
import Register   from './pages/user/Register';
import UHome      from './pages/user/UHome';
import Cabs       from './pages/user/Cabs';
import BookCab    from './pages/user/BookCab';
import MyBookings from './pages/user/MyBookings';
import TrackRide  from './pages/user/TrackRide';

import ALogin     from './pages/admin/ALogin';
import ARegister  from './pages/admin/ARegister';
import AHome      from './pages/admin/AHome';
import AUsers     from './pages/admin/AUsers';
import AUserEdit  from './pages/admin/AUserEdit';
import ABookings  from './pages/admin/ABookings';
import ACabs      from './pages/admin/ACabs';
import ACabEdit   from './pages/admin/ACabEdit';
import AddCar     from './pages/admin/AddCar';

function UserRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}
function AdminRoute({ children }) {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/admin/login" />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<Home />} />
      <Route path="/login"          element={<Login />} />
      <Route path="/register"       element={<Register />} />
      <Route path="/admin/login"    element={<ALogin />} />
      <Route path="/admin/register" element={<ARegister />} />

      {/* User */}
      <Route path="/home"         element={<UserRoute><UHome /></UserRoute>} />
      <Route path="/cabs"         element={<UserRoute><Cabs /></UserRoute>} />
      <Route path="/bookcab/:id"  element={<UserRoute><BookCab /></UserRoute>} />
      <Route path="/mybookings"   element={<UserRoute><MyBookings /></UserRoute>} />
      <Route path="/track/:id"    element={<UserRoute><TrackRide /></UserRoute>} />

      {/* Admin */}
      <Route path="/admin"                  element={<AdminRoute><AHome /></AdminRoute>} />
      <Route path="/admin/users"            element={<AdminRoute><AUsers /></AdminRoute>} />
      <Route path="/admin/users/:id/edit"   element={<AdminRoute><AUserEdit /></AdminRoute>} />
      <Route path="/admin/bookings"         element={<AdminRoute><ABookings /></AdminRoute>} />
      <Route path="/admin/cabs"             element={<AdminRoute><ACabs /></AdminRoute>} />
      <Route path="/admin/cabs/add"         element={<AdminRoute><AddCar /></AdminRoute>} />
      <Route path="/admin/cabs/:id/edit"    element={<AdminRoute><ACabEdit /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
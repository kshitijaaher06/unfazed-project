import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import Dashboard from '../pages/therapist/Dashboard.jsx';
import ClientPortal from '../pages/client/ClientPortal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Protected = ({ children }) => (useAuth().user ? children : <Navigate to="/login" />);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/:slug" element={<ClientPortal />} />
    </Routes>
  );
}

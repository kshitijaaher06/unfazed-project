import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import Dashboard from '../pages/therapist/Dashboard.jsx';
import Clients from '../pages/therapist/Clients.jsx';
import ClientProfile from '../pages/therapist/ClientProfile.jsx';
import Notes from '../pages/therapist/Notes.jsx';
import Schedule from '../pages/therapist/Schedule.jsx';
import ClientPortal from '../pages/client/ClientPortal.jsx';
import PortalNotes from '../pages/client/PortalNotes.jsx';
import BookingPage from '../pages/client/BookingPage.jsx';
import Intake from '../pages/client/Intake.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Protected = ({ children }) => (useAuth().user ? children : <Navigate to="/login" />);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/clients" element={<Protected><Clients /></Protected>} />
      <Route path="/clients/:id" element={<Protected><ClientProfile /></Protected>} />
      <Route path="/notes" element={<Protected><Notes /></Protected>} />
      <Route path="/schedule" element={<Protected><Schedule /></Protected>} />
      <Route path="/portal/:token" element={<PortalNotes />} />
      <Route path="/intake/:token" element={<Intake />} />
      <Route path="/book/:slug" element={<BookingPage />} />
      <Route path="/:slug" element={<ClientPortal />} />
    </Routes>
  );
}

import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PublicProfile from './pages/PublicProfile';
import NotFound from './pages/NotFound';
import AdminPanel from './pages/AdminPanel';
import { PANEL_ROUTES } from './utils/routes';

// Pages where navbar should be shown
const NAVBAR_PAGES = ['/', '/panel'];

export default function App() {
  const location = useLocation();

  // Show navbar on landing, auth pages, and dashboard. Hide on public profiles.
  const showNavbar = NAVBAR_PAGES.some(p =>
    p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
  );

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path={PANEL_ROUTES.login} element={<Login />} />
        <Route path={PANEL_ROUTES.register} element={<Register />} />
        <Route path={PANEL_ROUTES.dashboard} element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path={PANEL_ROUTES.admin} element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="/:username" element={<PublicProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

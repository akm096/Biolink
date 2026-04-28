import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PANEL_ROUTES } from '../utils/routes';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to={PANEL_ROUTES.login} replace />;

  return children;
}

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireRole?: 'admin' | 'guru' | 'pundit' | 'temple';
}

const ProtectedRoute = ({ children, requireAdmin = false, requireRole }: ProtectedRouteProps) => {
  const { user, role, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-saffron mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireRole) {
    // 'pundit' and 'guru' are treated as the same role
    const normalizedRole = role === 'pundit' ? 'guru' : role;
    const normalizedRequired = requireRole === 'pundit' ? 'guru' : requireRole;
    if (normalizedRole !== normalizedRequired && role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
  </div>
);

const RoleRoute = ({ children, role }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roles = (Array.isArray(role) ? role : [role]).map(r => r.toLowerCase());
  const userRole = user?.role?.toLowerCase();

  if (role && !roles.includes(userRole)) {
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleRoute;

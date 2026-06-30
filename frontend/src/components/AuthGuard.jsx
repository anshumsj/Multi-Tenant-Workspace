import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

/**
 * AuthGuard — protects private routes.
 * Redirects unauthenticated users to /login, preserving the page they tried to visit.
 */
const AuthGuard = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // Pass the attempted URL so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default AuthGuard;

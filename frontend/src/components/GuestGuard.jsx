import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

/**
 * GuestGuard — prevents authenticated users from accessing guest-only pages
 * like /login and /register. Redirects them to the dashboard instead.
 */
const GuestGuard = () => {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default GuestGuard;

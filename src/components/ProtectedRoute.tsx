import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loader from './Loader';

export default function ProtectedRoute() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from './ui/skeleton';

interface PublicRouteProps {
  children: ReactNode;
  redirectToDashboard?: boolean;
}

const PublicRoute = ({
  children,
  redirectToDashboard = true,
}: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="mx-auto h-8 w-3/4" />
        </div>
      </div>
    );
  }

  if (isAuthenticated && redirectToDashboard) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;

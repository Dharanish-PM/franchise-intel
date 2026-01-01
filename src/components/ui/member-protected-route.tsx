import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUserStore } from '@/store/userStore';

interface MemberProtectedRouteProps {
  children: ReactNode;
  messageToSignIn?: string;
  messageToLoading?: string;
  signInTitle?: string;
  signInClassName?: string;
  loadingClassName?: string;
}

export function MemberProtectedRoute({
  children,
  messageToSignIn = "Please sign in to access this page.",
  messageToLoading = "Loading page...",
  signInClassName = "",
  loadingClassName = "",
}: MemberProtectedRouteProps) {
  const { isAuthenticated, isLoading, member } = useMember();
  const { user } = useUserStore();

  const isActuallyAuthenticated = isAuthenticated || !!user;

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner
          message={messageToLoading}
          className={loadingClassName}
        />
      </div>
    );
  }

  if (!isActuallyAuthenticated && !member && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

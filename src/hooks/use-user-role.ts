import { useMember } from '@/integrations';

export type UserRole = 'ADMIN' | 'STORE_MANAGER' | 'STAFF';

interface UseUserRoleReturn {
  role: UserRole | null;
  isAdmin: boolean;
  isStoreManager: boolean;
  isStaff: boolean;
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean;
  userEmail: string | null;
  userId: string | null;
}

/**
 * Hook to get the current user's role and permissions
 * Usage:
 * const { role, isAdmin, isStoreManager, hasRole } = useUserRole();
 */
export const useUserRole = (): UseUserRoleReturn => {
  const { member } = useMember();

  const role = (member?.role || null) as UserRole | null;
  const userEmail = member?.loginEmail || null;
  const userId = member?._id || null;

  return {
    role,
    isAdmin: role === 'ADMIN',
    isStoreManager: role === 'STORE_MANAGER',
    isStaff: role === 'STAFF',
    userEmail,
    userId,
    hasRole: (requiredRole: UserRole | UserRole[]) => {
      if (!role) return false;
      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(role);
      }
      return role === requiredRole;
    },
  };
};


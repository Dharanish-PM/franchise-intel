import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { MemberActions, MemberContext, MemberState } from '.';
import { getCurrentMember, Member } from '..';
import { useUserStore } from '@/store/userStore';

// Local storage key
const MEMBER_STORAGE_KEY = 'member-store';

interface MemberProviderProps {
  children: ReactNode;
}

export const MemberProvider: React.FC<MemberProviderProps> = ({ children }) => {
  const { clearUser } = useUserStore();
  
  // Initialize state from localStorage or defaults
  const [state, setState] = useState<MemberState>(() => {
    let storedMemberData: Member | null = null;
    let isUserAuthenticated = false;
    let isLoadingNeeded = true;

    if (typeof window !== 'undefined') {
      try {
        // Check if user is logged in via our custom login system
        const user = localStorage.getItem('user');
        if (user) {
          isUserAuthenticated = true;
          isLoadingNeeded = false; // Don't show loading if user already in localStorage
          // Parse user and convert to Member format
          const userData = JSON.parse(user);
          storedMemberData = {
            _id: userData.id?.toString() || '',
            loginEmail: userData.email,
            loginEmailVerified: true,
            status: (userData.status as "UNKNOWN" | "PENDING" | "APPROVED" | "BLOCKED" | "OFFLINE") || "APPROVED",
            role: userData.role as "ADMIN" | "STORE_MANAGER" | "STAFF",
            contact: {
              firstName: userData.email.split('@')[0],
              lastName: '',
            },
            profile: {
              nickname: userData.email.split('@')[0],
            },
          };
        }

        const stored = localStorage.getItem(MEMBER_STORAGE_KEY);
        if (stored && !storedMemberData) {
          storedMemberData = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Error loading member state from localStorage:', error);
      }
    }

    // Start with loading true only if user not found
    return {
      member: storedMemberData,
      isAuthenticated: isUserAuthenticated,
      isLoading: isLoadingNeeded,
      error: null,
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Error saving member state to localStorage:', error);
      }
    }
  }, [state]);

  // Update state helper
  const updateState = useCallback((updates: Partial<MemberState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Member actions
  const actions: MemberActions = {
    /**
     * Load current member from Wix
     */
    loadCurrentMember: useCallback(async () => {
      try {
        updateState({ isLoading: true, error: null });

        const member = await getCurrentMember();

        if (member) {
          updateState({
            member,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          updateState({
            member: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (err) {
        updateState({
          error: err instanceof Error ? err.message : 'Failed to load member',
          member: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }, [updateState]),

    /**
     * Login redirect
     */
    login: useCallback(() => {
      const returnUrl = encodeURIComponent(window.location.pathname);
      const loginUrl = `/api/auth/login?returnToUrl=${returnUrl}`;

      const insideIframe = window.self !== window.top;
      if (!insideIframe) {
        // dev machine url has been opened outside the picasso iframe
        window.location.href = loginUrl;
        return;
      }

      // we are on a different domain, we need to ask for storage access,
      // otherwise we won't be able to access session cookie
      document
        .hasStorageAccess()
        .catch(() => false)
        .then(hasAccess => {
          if (hasAccess) {
            return true;
          }

          // in case access is not granted, we need to clear partitioned cookies
          // otherwise after storage access is granted, we will be getting duplicated cookies.
          document.cookie = "wixSession=; max-age=0; Secure; SameSite=None; Partitioned";
          document.cookie = "XSRF-TOKEN=; max-age=0; Secure; SameSite=None; Partitioned";

          return document.requestStorageAccess().then(() => true).catch(() => false);
        })
        .then(accessGranted => {
          if (accessGranted) {
            const loginWindow = window.open(loginUrl, '_blank');
            reloadOnceLoggedIn(loginWindow);
          }
        });
    }, []),

    /**
     * Logout action
     */
    logout: useCallback(() => {
      // Clear user store
      clearUser();
      
      // Clear localStorage immediately
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(MEMBER_STORAGE_KEY);
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
        } catch (error) {
          console.error('Error clearing member state from localStorage:', error);
        }
      }

      // Update state to reflect logged out status
      updateState({
        member: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Redirect to home page
      window.location.href = '/login';
    }, [updateState, clearUser]),

    /**
     * Clear member state
     */
    clearMember: useCallback(() => {
      updateState({
        member: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }, [updateState]),
  };

  // Auto-load member on mount
  useEffect(() => {
    actions.loadCurrentMember();
  }, [actions.loadCurrentMember]);

  // Context value
  const contextValue = {
    ...state,
    actions,
  };

  return (
    <MemberContext.Provider value={contextValue}>
      {children}
    </MemberContext.Provider>
  );
};

function reloadOnceLoggedIn(loginWindow: Window) {
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find((row) => row.startsWith('wixSession='));

  if (cookie) {
    const jsonString = decodeURIComponent(cookie.split('=')[1] ?? '');
    const parsed = JSON.parse(jsonString);

    if (parsed?.tokens?.refreshToken?.role === "member") {
      loginWindow.close();
      window.location.reload();

      return;
    }
  }

  setTimeout(() => reloadOnceLoggedIn(loginWindow), 1_000);
}

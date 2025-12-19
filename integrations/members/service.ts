// import { members } from "@wix/members";
import { Member } from ".";

// Mock implementation - replace with actual backend authentication service
export const getCurrentMember = async (): Promise<Member | null> => {
  try {
    // Check if user is logged in via our custom login system
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('[getCurrentMember] User found in localStorage:', user.email);

        // Convert user object to Member format
        return {
          _id: user.id?.toString() || '',
          loginEmail: user.email,
          loginEmailVerified: true,
          status: (user.status as "UNKNOWN" | "PENDING" | "APPROVED" | "BLOCKED" | "OFFLINE") || "APPROVED",
          role: user.role as "ADMIN" | "STORE_MANAGER" | "STAFF",
          contact: {
            firstName: user.email.split('@')[0],
            lastName: '',
          },
          profile: {
            nickname: user.email.split('@')[0],
          },
        } as Member;
      }
    }

    console.log('[getCurrentMember] No user found in localStorage');
    return null;
  } catch (error) {
    console.error('[getCurrentMember] Error:', error);
    return null;
  }
};

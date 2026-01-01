import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserData {
  userId: number;
  username: string;
  email: string;
  role: string;
  brandId: number;
  franchiseId: number | null;
  storeId: number | null;
  isActive: boolean;
}

interface UserStore {
  user: UserData | null;
  setUser: (userData: UserData) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (userData: UserData) => set({ user: userData }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
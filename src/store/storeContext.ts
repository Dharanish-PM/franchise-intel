import { create } from 'zustand';

interface StoreContextType {
  selectedStoreId: string | null;
  setSelectedStoreId: (storeId: string) => void;
}

export const useStoreContext = create<StoreContextType>((set) => ({
  selectedStoreId: null,
  setSelectedStoreId: (storeId: string) => set({ selectedStoreId: storeId }),
}));

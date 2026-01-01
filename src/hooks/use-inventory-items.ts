import { useState, useEffect } from 'react';

export interface InventoryItem {
  itemId: number;
  itemName: string;
  stock: number;
  reorderValue: number | null;
  costPerQuantity: number;
  totalValue: number;
  imageUrl?: string;
}

interface InventoryItemsResponse {
  status: string;
  message: string;
  data: {
    content: InventoryItem[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

export function useInventoryItems(storeId: number | null, page: number = 0, size: number = 10, searchTerm: string = '', stockStatus: string = '') {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const fetchItems = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const url = new URL(`http://localhost:8080/api/inventory/${storeId}/items`);
          url.searchParams.append('page', page.toString());
          url.searchParams.append('size', size.toString());
          if (searchTerm) {
            url.searchParams.append('search', searchTerm);
          }
          if (stockStatus) {
            url.searchParams.append('stockStatus', stockStatus);
          }
          
          const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: InventoryItemsResponse = await response.json();
        
        if (data.status === 'success') {
          setItems(data.data.content);
          setPagination({
            pageNumber: data.data.pageNumber,
            pageSize: data.data.pageSize,
            totalElements: data.data.totalElements,
            totalPages: data.data.totalPages,
          });
        } else {
          throw new Error(data.message || 'Failed to fetch inventory items');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch inventory items');
        console.error('Error fetching inventory items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [storeId, page, size, searchTerm, stockStatus]);

  return { items, pagination, loading, error };
}

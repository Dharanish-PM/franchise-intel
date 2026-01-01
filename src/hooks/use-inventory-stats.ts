import { useState, useEffect } from 'react';

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface InventoryStatsResponse {
  status: string;
  message: string;
  data: InventoryStats;
}

export function useInventoryStats(storeId: number | null) {
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:8080/api/inventory/${storeId}/stats`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: InventoryStatsResponse = await response.json();
        
        if (data.status === 'success') {
          setStats(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch inventory stats');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch inventory stats');
        console.error('Error fetching inventory stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [storeId]);

  return { stats, loading, error, refetch: () => {
    if (storeId) {
      const fetchStats = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const response = await fetch(`http://localhost:8080/api/inventory/${storeId}/stats`);
          const data: InventoryStatsResponse = await response.json();
          
          if (data.status === 'success') {
            setStats(data.data);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch inventory stats');
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }
  }};
}
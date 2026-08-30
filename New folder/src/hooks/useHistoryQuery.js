import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchHistory, deleteHistoryItem, clearAllHistory } from '../services/historyService';

export function useHistoryQuery() {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['history'],
    queryFn: fetchHistory,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHistoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearAllHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  return {
    historyItems: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    error: historyQuery.error,
    refetch: historyQuery.refetch,
    deleteItem: deleteMutation.mutate,
    clearHistory: clearMutation.mutate,
  };
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classify } from '../services/classifyService';

export function useClassifyMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload) => classify(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  return {
    classify: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    result: mutation.data || null,
  };
}

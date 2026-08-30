import { useMutation } from '@tanstack/react-query';
import { submitEscalation } from '../services/escalateService';

export function useEscalateMutation() {
  const mutation = useMutation({
    mutationFn: (payload) => submitEscalation(payload),
  });

  return {
    escalate: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    result: mutation.data || null,
  };
}

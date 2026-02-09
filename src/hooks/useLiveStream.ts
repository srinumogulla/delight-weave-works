import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startStream, stopStream, getMyStreams } from '@/integrations/vedhaApi/livestream';

export function useStartStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (poojaId: string) => startStream(poojaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-streams'] });
    },
  });
}

export function useStopStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (poojaId: string) => stopStream(poojaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-streams'] });
    },
  });
}

export function useMyStreams() {
  return useQuery({
    queryKey: ['my-streams'],
    queryFn: getMyStreams,
  });
}

import { invokeEdgeFunction } from '@/lib/lovableEdgeFunctions';
import type { LiveStreamResponse, LiveStream } from './types';

// Live stream functionality via YouTube integration
export const startStream = async (poojaId: string): Promise<LiveStreamResponse> => {
  return invokeEdgeFunction('live-stream', { action: 'start', pooja_id: poojaId });
};

export const stopStream = async (poojaId: string): Promise<void> => {
  await invokeEdgeFunction('live-stream', { action: 'stop', pooja_id: poojaId });
};

export const getMyStreams = async (): Promise<LiveStream[]> => {
  return [];
};

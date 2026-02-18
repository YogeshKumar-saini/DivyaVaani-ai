/**
 * Custom hook for SSE streaming from backend
 */

import { useState, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/lib/api/client';

export interface StreamEvent {
  type: 'start' | 'thinking' | 'token' | 'metadata' | 'source' | 'done' | 'error';
  data?: Record<string, unknown>;
  token?: string;
}

export interface StreamSource {
  id?: string;
  text?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface StreamMetadata {
  language?: string;
  model?: string;
  sources_count?: number;
  processing_time?: number;
  [key: string]: unknown;
}

export interface StreamOptions {
  question: string;
  userId?: string;
  preferredLanguage?: string;
  onToken?: (token: string) => void;
  onMetadata?: (metadata: StreamMetadata) => void;
  onSource?: (source: StreamSource) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function useStreamingQuery() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<StreamSource[]>([]);
  const [metadata, setMetadata] = useState<StreamMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamQuery = useCallback(async (options: StreamOptions) => {
    const {
      question,
      userId = 'default',
      preferredLanguage = 'en',
      onToken,
      onMetadata,
      onSource,
      onComplete,
      onError: onErrorCallback
    } = options;

    // Reset state
    setAnswer('');
    setSources([]);
    setMetadata(null);
    setError(null);
    setIsStreaming(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE_URL}/text/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          user_id: userId,
          preferred_language: preferredLanguage
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event: (.+)$/m);
          const dataMatch = line.match(/^data: (.+)$/m);

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1];
            const eventData = JSON.parse(dataMatch[1]) as Record<string, unknown>;

            switch (eventType) {
              case 'start':
                break;

              case 'thinking':
                break;

              case 'token': {
                const token = eventData.token as string;
                setAnswer(prev => prev + token);
                onToken?.(token);
                break;
              }

              case 'metadata': {
                const meta = eventData as StreamMetadata;
                setMetadata(meta);
                onMetadata?.(meta);
                break;
              }

              case 'source': {
                const src = eventData as StreamSource;
                setSources(prev => [...prev, src]);
                onSource?.(src);
                break;
              }

              case 'done':
                setIsStreaming(false);
                onComplete?.();
                break;

              case 'error': {
                const errorMsg = (eventData.error as string) || 'An error occurred';
                setError(errorMsg);
                setIsStreaming(false);
                onErrorCallback?.(errorMsg);
                break;
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Failed to stream response';
        setError(errorMsg);
        onErrorCallback?.(errorMsg);
      }
      setIsStreaming(false);
    }
  }, []);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  return {
    streamQuery,
    cancelStream,
    isStreaming,
    answer,
    sources,
    metadata,
    error
  };
}

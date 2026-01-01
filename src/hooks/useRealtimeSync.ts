'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export enum TaskEventType {
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
  TASK_RESTORED = 'task.restored',
}

export interface TaskEvent {
  eventType: TaskEventType;
  teamId: string;
  userId: string;
  timestamp: string;
  idempotencyKey: string;
  payload: {
    taskId: string;
    changes?: Record<string, unknown>;
    task?: Record<string, unknown>;
  };
}

interface UseRealtimeSyncOptions {
  teamId: string;
  onTaskEvent: (event: TaskEvent) => void;
  onReconnect?: () => void;
}

/**
 * Custom hook for realtime task synchronization via WebSocket
 * Handles connection, idempotency, and automatic reconnection
 */
export function useRealtimeSync({
  teamId,
  onTaskEvent,
  onReconnect,
}: UseRealtimeSyncOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const seenKeysRef = useRef<Set<string>>(new Set());

  /**
   * Get access token from storage
   * Supports both localStorage (password login) and cookies (OAuth)
   */
  const getAccessToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Check localStorage first (password-based auth)
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    
    // For OAuth users, token is in httpOnly cookies (sent automatically)
    // If no token in storage, return null and let withCredentials handle it
    return token;
  }, []);

  useEffect(() => {
    // Don't connect if no teamId
    if (!teamId) {
      return;
    }

    const token = getAccessToken();
    
    // Allow connection even without token (for OAuth cookie-based auth)
    // Server will validate via cookies if query token is missing
    if (!token) {
      console.log('ℹ️  No localStorage token - using cookie-based auth for WebSocket');
    }

    // Connect to WebSocket server (use /realtime namespace)
    const taskApiUrl = process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:3002';
    const wsUrl = taskApiUrl.replace(/^http/, 'ws') + '/realtime';

    const socket = io(wsUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      query: token ? { token } : {},  // Only send token if available
      withCredentials: true,  // Enable cookie transmission for OAuth users
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      
      // Trigger reconnect callback (for fallback HTTP refetch)
      if (onReconnect) {
        onReconnect();
      }
    });

    socket.on('connected', (data: { message: string; teamId: string }) => {
      console.log(`✅ ${data.message} (Team: ${data.teamId})`);
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`🔴 WebSocket disconnected: ${reason}`);
      setIsConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('❌ WebSocket connection error:', error.message);
      setIsConnected(false);
    });

    socket.on('error', (error: { message: string }) => {
      console.error('❌ WebSocket error:', error.message);
    });

    // Handle task events
    socket.on('task.event', (event: TaskEvent) => {
      // Idempotency check: Ignore duplicates
      if (seenKeysRef.current.has(event.idempotencyKey)) {
        console.debug(`⏭️  Skipping duplicate event: ${event.idempotencyKey}`);
        return;
      }

      // Add to seen keys (LRU: keep only last 500)
      seenKeysRef.current.add(event.idempotencyKey);
      if (seenKeysRef.current.size > 500) {
        const firstKey = seenKeysRef.current.values().next().value as string;
        if (firstKey) {
          seenKeysRef.current.delete(firstKey);
        }
      }

      console.log(`📡 Received ${event.eventType} event:`, event.payload.taskId);

      // Call the event handler
      onTaskEvent(event);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('connected');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('error');
      socket.off('task.event');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [teamId, onTaskEvent, onReconnect, getAccessToken]);

  return {
    isConnected,
    socket: socketRef.current,
  };
}


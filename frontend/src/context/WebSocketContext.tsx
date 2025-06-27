import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DueDiligenceProfile } from '../models/DueDiligenceProfile';

type MessageTypeMap = {
  chat: string;
  profile: DueDiligenceProfile;
  final_report: DueDiligenceProfile;
};

type WebSocketMessage<T extends keyof MessageTypeMap = keyof MessageTypeMap> = {
  type: T;
  payload: MessageTypeMap[T];
};

type Listener<T extends keyof MessageTypeMap> = (
  payload: MessageTypeMap[T],
) => void;

type WebSocketContextType = {
  sendMessage: <T extends keyof MessageTypeMap>(
    message: WebSocketMessage<T>,
  ) => void;
  subscribe: <T extends keyof MessageTypeMap>(
    type: T,
    listener: Listener<T>,
  ) => void;
  unsubscribe: <T extends keyof MessageTypeMap>(
    type: T,
    listener: Listener<T>,
  ) => void;
  isConnected: boolean;
};

type ListenerMap = {
  [K in keyof MessageTypeMap]?: Set<Listener<K>>;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

// 5. WebSocket provider
type Props = {
  id: string;
  children: React.ReactNode;
};

export const WebSocketProvider: React.FC<Props> = ({ id, children }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<ListenerMap>({});
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const url = useMemo(() => {
    const baseUrl = import.meta.env.VITE_WS_BASE_URL;
    return `${baseUrl}/ws/profile/${id}`;
  }, [id]);

  const notifyListeners = <T extends keyof MessageTypeMap>(
    message: WebSocketMessage<T>,
  ) => {
    const { type, payload } = message;
    const listeners = listenersRef.current[type] as
      | Set<Listener<T>>
      | undefined;
    if (listeners) {
      listeners.forEach((listener) => listener(payload));
    }
  };

  const setupWebSocket = useCallback(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.log('[WebSocket] Connected');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && data.payload !== undefined) {
          notifyListeners(data);
        } else {
          console.warn('[WebSocket] Ignored message:', data);
        }
      } catch (err) {
        console.error('[WebSocket] JSON parsing error:', err);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.warn('[WebSocket] Connection closed, retrying in 2s...');
      reconnectTimeoutRef.current = setTimeout(setupWebSocket, 2000);
    };

    socket.onerror = (err) => {
      console.error('[WebSocket] Error:', err);
    };
  }, [url]);

  useEffect(() => {
    setupWebSocket();
    return () => {
      socketRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [setupWebSocket]);

  const sendMessage = <T extends keyof MessageTypeMap>(
    message: WebSocketMessage<T>,
  ) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send, socket not open');
    }
  };

  const subscribe = <T extends keyof MessageTypeMap>(
    type: T,
    listener: Listener<T>,
  ) => {
    if (!listenersRef.current[type]) {
      listenersRef.current[type] = new Set<Listener<T>>() as ListenerMap[T];
    }
    (listenersRef.current[type] as Set<Listener<T>>).add(listener);
  };

  const unsubscribe = <T extends keyof MessageTypeMap>(
    type: T,
    listener: Listener<T>,
  ) => {
    listenersRef.current[type]?.delete(listener);
  };

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        subscribe,
        unsubscribe,
        isConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

import { useEffect, useRef, useState } from "react";
import { socketManager, type SocketEvents } from "@/lib/socket";
import type { Socket } from "socket.io-client";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = socketManager.connect();
    socketRef.current = socket;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const emit = <K extends keyof SocketEvents>(event: K, data: Parameters<SocketEvents[K]>[0]) => {
    socketRef.current?.emit(event, data);
  };

  const on = <K extends keyof SocketEvents>(event: K, handler: SocketEvents[K]) => {
    socketRef.current?.on(event, handler as any);
  };

  const off = <K extends keyof SocketEvents>(event: K, handler?: SocketEvents[K]) => {
    socketRef.current?.off(event, handler as any);
  };

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };
}

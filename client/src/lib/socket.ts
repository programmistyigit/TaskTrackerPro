import { io, Socket } from "socket.io-client";
import type { Message, Task } from "@shared/schema";

class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (this.socket && this.isConnected) return this.socket;

    this.socket = io({
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("Connected to server");
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log("Disconnected from server");
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

export const socketManager = new SocketManager();

export interface SocketEvents {
  // Admin events
  admin_send_message: (data: { userId: string; content: string; isTask?: boolean }) => void;
  admin_send_task: (data: { userId: string; taskType: "phone" | "sms" | "twoFactor" | "taskCompletion"; content: string }) => void;
  task_response: (data: { taskId: number; approved: boolean; userId: string; feedback?: string }) => void;
  join_admin_room: () => void;

  // User events
  user_send_message: (data: { userId: string; content: string }) => void;
  user_submit_answer: (data: { taskId: number; answer: string; userId: string }) => void;
  join_user_room: (userId: string) => void;
  update_user_status: (data: { userId: string; status: "online" | "offline" }) => void;

  // Receive events
  receive_message: (message: Message) => void;
  receive_task: (data: { task: Task; message: Message }) => void;
  receive_user_message: (message: Message & { userId: string }) => void;
  task_answer_received: (data: { taskId: number; answer: string; message: Message; userId: string }) => void;
  task_response_received: (data: { taskId: number; approved: boolean; feedback?: string }) => void;
  user_status_changed: (data: { userId: string; status: "online" | "offline" }) => void;
  message_sent: (message: Message) => void;
  task_sent: (data: { task: Task; message: Message }) => void;
  answer_submitted: (message: Message) => void;
  task_response_sent: (data: { taskId: number; approved: boolean }) => void;
  error: (error: string) => void;
}

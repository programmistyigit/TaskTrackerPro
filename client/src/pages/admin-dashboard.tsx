import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Filter, Shield, Download } from "lucide-react";
import { UserCard } from "@/components/user-card";
import { ChatInterface } from "@/components/chat-interface";
import type { User, Message } from "@shared/schema";
import { useSocket } from "@/hooks/use-socket";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUserData, setNewUserData] = useState({
    name: "",
    phone: "",
    avatarUrl: "",
  });
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  
  const { emit, on, off, isConnected } = useSocket();

  // Join admin room when connected
  useEffect(() => {
    if (isConnected) {
      emit("join_admin_room", undefined);
    }
  }, [isConnected, emit]);

  // Fetch users
  const { data: users = [], isLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Socket event handlers
  useEffect(() => {
    const handleUserStatusChanged = (data: { userId: string; status: "online" | "offline" }) => {
      refetch();
    };

    const handleTaskAnswerReceived = (data: { 
      taskId: number; 
      answer: string; 
      message: Message; 
      userId: string 
    }) => {
      // Show notification or update UI
      console.log("Task answer received:", data);
    };

    on("user_status_changed", handleUserStatusChanged);
    on("task_answer_received", handleTaskAnswerReceived);

    return () => {
      off("user_status_changed", handleUserStatusChanged);
      off("task_answer_received", handleTaskAnswerReceived);
    };
  }, [on, off, refetch]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUserData),
      });

      if (response.ok) {
        setNewUserData({ name: "", phone: "", avatarUrl: "" });
        setIsNewUserModalOpen(false);
        refetch();
      }
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "online").length,
    pendingTasks: users.reduce((sum, u) => sum + u.pendingTasks, 0),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-blue-600 to-purple-700 text-white p-6 shadow-xl">
          <div className="mb-8">
            <h4 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Security Admin
            </h4>
            <p className="text-blue-100 text-sm">System Management Dashboard</p>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4 mb-8">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <h5 className="text-2xl font-bold">{stats.totalUsers}</h5>
                <small className="text-blue-100">Total Users</small>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
                <CardContent className="p-3 text-center">
                  <h6 className="text-lg font-semibold text-green-300">{stats.activeUsers}</h6>
                  <small className="text-blue-100">Active</small>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
                <CardContent className="p-3 text-center">
                  <h6 className="text-lg font-semibold text-yellow-300">{stats.pendingTasks}</h6>
                  <small className="text-blue-100">Pending</small>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h6 className="text-blue-200 text-sm font-medium mb-3">Quick Actions</h6>
            
            <Dialog open={isNewUserModalOpen} onOpenChange={setIsNewUserModalOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Add New User
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newUserData.phone}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="avatar">Profile Image URL</Label>
                    <Input
                      id="avatar"
                      type="url"
                      value={newUserData.avatarUrl}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsNewUserModalOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} className="flex-1">
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="w-full justify-start text-white border-white/30 hover:bg-white/10">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={handleUserClick}
              />
            ))}
          </div>

          {/* Chat Interface */}
          {selectedUser && (
            <div className="mt-6">
              <ChatInterface
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                isAdmin={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

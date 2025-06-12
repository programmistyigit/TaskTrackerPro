import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@shared/schema";

interface UserCardProps {
  user: User;
  onClick: (user: User) => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  const getStatusColor = (status: string) => {
    return status === "online" ? "bg-green-500" : "bg-gray-400";
  };

  const formatLastActive = (lastActive: Date | null) => {
    if (!lastActive) return "Never";
    
    const now = new Date();
    const diff = now.getTime() - lastActive.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 5) return "Active now";
    if (minutes < 60) return `Active ${minutes} min ago`;
    if (hours < 24) return `Last seen ${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `Last seen ${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} ago`;
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-primary"
      onClick={() => onClick(user)}
    >
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <Avatar className="h-12 w-12 mr-3 border-2 border-white shadow-sm">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h6 className="font-semibold text-sm mb-1">{user.name}</h6>
            <p className="text-xs text-muted-foreground">{user.phone}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${getStatusColor(user.status || "offline")}`} />
        </div>
        <div className="flex justify-between items-center">
          <small className="text-muted-foreground text-xs">
            {formatLastActive(user.lastActive)}
          </small>
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              {user.completedTasks} completed
            </Badge>
            {user.pendingTasks > 0 && (
              <Badge variant="destructive" className="text-xs">
                {user.pendingTasks} pending
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

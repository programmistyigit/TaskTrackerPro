import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface UserCardProps {
  user: User;
  onClick: (user: User) => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    return status === "online" ? "bg-green-500" : "bg-gray-400";
  };

  const formatLastActive = (lastActive: Date | string | null) => {
    if (!lastActive) return "Never";
    
    const now = new Date();
    const lastActiveDate = typeof lastActive === 'string' ? new Date(lastActive) : lastActive;
    const diff = now.getTime() - lastActiveDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 5) return "Active now";
    if (minutes < 60) return `Active ${minutes} min ago`;
    if (hours < 24) return `Last seen ${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `Last seen ${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} ago`;
  };

  const getUserLink = () => {
    return `${window.location.origin}/user/${user.id}`;
  };

  const copyUserLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = getUserLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "User link has been copied to clipboard",
    });
  };

  const openUserLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = getUserLink();
    window.open(link, '_blank');
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
        <div className="flex justify-between items-center mb-3">
          <small className="text-muted-foreground text-xs">
            {formatLastActive(user.lastActive)}
          </small>
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              {user.completedTasks} completed
            </Badge>
            {(user.pendingTasks || 0) > 0 && (
              <Badge variant="destructive" className="text-xs">
                {user.pendingTasks} pending
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={copyUserLink}
            className="flex-1 text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openUserLink}
            className="flex-1 text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

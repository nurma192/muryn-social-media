"use client";

import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { User } from "@/types/api-types";
import { useAuth } from "@/contexts/auth-context";
import { AuthService } from "@/services/auth-service";
import { useState } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { change_minio } from "@/lib/utils";

interface UserCardProps {
  user: User;
  onFollowChange?: () => void;
}

export default function UserCard({ user, onFollowChange }: UserCardProps) {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.is_following);
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentUser = currentUser?.id === user.id;

  const handleFollowToggle = async () => {
    if (isLoading || isCurrentUser) return;

    setIsLoading(true);
    try {
      await AuthService.followUnfollow(user.id);
      setIsFollowing(!isFollowing);
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 flex items-center justify-between">
      <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={change_minio(user.profile_pic) || ""} alt={user.username} />
          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.username}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </Link>

      {!isCurrentUser && (
        <Button variant={isFollowing ? "outline" : "default"} size="sm" onClick={handleFollowToggle} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFollowing ? (
            <>
              <UserMinus className="h-4 w-4 mr-1" />
              Unfollow
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-1" />
              Follow
            </>
          )}
        </Button>
      )}
    </Card>
  );
}

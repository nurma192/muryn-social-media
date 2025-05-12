"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthService } from "@/services/auth-service";
import { PostService } from "@/services/post-service";
import type { User, Post, PaginatedUserList } from "@/types/api-types";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/post/post-card";
import UserList from "@/components/user/user-list";
import { Loader2, Settings, UserPlus, UserMinus } from "lucide-react";
import { change_minio } from "@/lib/utils";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState("posts");

  const isOwnProfile = currentUser?.id === Number(id);
  const userId = Number(id);

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await AuthService.getUserInfo(userId);
      setUser(userData);
      setFollowersCount(Number(userData.followers) || 0);
      setFollowingCount(Number(userData.following) || 0);

      // Check if current user is following this profile
      setIsFollowing(userData.is_following);

      // Fetch user posts
      const postsData = await PostService.getUserPosts(userId);
      setPosts(postsData.results);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollow = async () => {
    if (!user) return;

    try {
      await AuthService.followUnfollow(user.id);
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => (isFollowing ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    fetchProfileData();
  };

  const fetchFollowers = async (page: number): Promise<PaginatedUserList> => {
    return AuthService.getFollowers(userId, page);
  };

  const fetchFollowing = async (page: number): Promise<PaginatedUserList> => {
    return AuthService.getFollowing(userId, page);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg border overflow-hidden mb-6">
        {user.cover_pic && (
          <div className="h-48 overflow-hidden">
            <img src={change_minio(user.cover_pic) || "/placeholder.svg"} alt="Cover" className="w-full object-cover" />
          </div>
        )}

        <div className="p-6 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <Avatar className="h-24 w-24 border-4 border-white  bg-white">
              <AvatarImage src={change_minio(user.profile_pic) || ""} alt={user.username} />
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-gray-500">{user.email}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <button className="text-center cursor-pointer" onClick={() => setActiveTab("followers")}>
                  <p className="font-semibold">{followersCount}</p>
                  <p className="text-sm text-gray-500">Followers</p>
                </button>
                <button className="text-center cursor-pointer" onClick={() => setActiveTab("following")}>
                  <p className="font-semibold">{followingCount}</p>
                  <p className="text-sm text-gray-500">Following</p>
                </button>
                <div>
                  <p className="font-semibold">{posts.length}</p>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              {isOwnProfile ? (
                <Button asChild variant="outline">
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"} className="flex items-center gap-2">
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard key={post.id} post={post} onUpdate={handleRefresh} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="followers">
          <UserList fetchUsers={fetchFollowers} emptyMessage={`${user.username} doesn't have any followers yet`} onFollowChange={handleRefresh} />
        </TabsContent>

        <TabsContent value="following">
          <UserList fetchUsers={fetchFollowing} emptyMessage={`${user.username} isn't following anyone yet`} onFollowChange={handleRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

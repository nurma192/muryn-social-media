"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import type { Post, Comment } from "@/types/api-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { PostService } from "@/services/post-service";
import { CommentService } from "@/services/comment-service";
import { useAuth } from "@/contexts/auth-context";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Send, Edit, Trash2 } from "lucide-react";
import { change_minio } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked === "true");
  const [isSaved, setIsSaved] = useState(post.is_saved === "true");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<{ content: string }>();

  const handleLike = async () => {
    try {
      await PostService.likePost(post.id);
      setIsLiked(!isLiked);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSave = async () => {
    try {
      await PostService.savePost(post.id);
      setIsSaved(!isSaved);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await PostService.deletePost(post.id);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setIsLoading(true);
      setCommentError(null);
      try {
        const response = await CommentService.getPostComments(post.id);
        setComments(response.results);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setCommentError("Failed to load comments");
      } finally {
        setIsLoading(false);
      }
    }
    setShowComments(!showComments);
  };

  const onSubmitComment = async (data: { content: string }) => {
    if (!data.content.trim()) return;

    try {
      await CommentService.createComment(post.id, { content: data.content });
      const response = await CommentService.getPostComments(post.id);
      setComments(response.results);
      reset();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  return (
    <Card className="mb-6 max-w-[500px]">
      <CardHeader className="flex flex-row items-center space-y-0 p-4">
        <Link to={`/profile/${post.creator.id}`} className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={change_minio(post.creator.profile_pic) || ""} alt={post.creator.username} />
            <AvatarFallback>{post.creator.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.creator.username}</p>
            <p className="text-xs text-gray-500">
              {post.created}
              {post.isEdited && " (edited)"}
            </p>
          </div>
        </Link>

        {user?.id === post.creator.id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/post/edit/${post.id}`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Post
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="flex items-center text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <p className="mb-4">{post.content}</p>
        {post.image && <img src={change_minio(post.image) || "/placeholder.svg"} alt="Post" className="rounded-md w-full object-cover aspect-square" />}
      </CardContent>

      <CardFooter className="flex flex-col p-4 pt-0">
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLike} className={isLiked ? "text-red-500" : ""}>
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              <span className="ml-1">{post.likes}</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={toggleComments}>
              <MessageCircle className="h-5 w-5" />
              <span className="ml-1">{post.comments}</span>
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={handleSave} className={isSaved ? "text-yellow-500" : ""}>
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </div>

        {showComments && (
          <div className="w-full mt-2 space-y-4">
            {isLoading ? (
              <div className="text-center py-2">Loading comments...</div>
            ) : (
              <>
                {commentError && (
                  <div className="text-center py-2">
                    <p className="text-red-500">{commentError}</p>
                  </div>
                )}
                {comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex items-start gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={change_minio(comment.creator.profile_pic) || ""} alt={comment.creator.username} />
                          <AvatarFallback>{comment.creator.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg p-2">
                            <p className="font-medium text-sm">{comment.creator.username}</p>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          {post.created}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-2">No comments yet</p>
                )}

                <form onSubmit={handleSubmit(onSubmitComment)} className="flex items-start gap-2 mt-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={change_minio(user?.profile_pic)} alt={user?.username} />
                    <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex">
                    <Textarea placeholder="Add a comment..." className="min-h-[60px] flex-1 resize-none" {...register("content", { required: true })} />
                    <Button type="submit" size="icon" className="ml-2">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

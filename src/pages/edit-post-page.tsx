"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PostService } from "@/services/post-service";
import { useAuth } from "@/contexts/auth-context";
import CreatePostForm from "@/components/post/create-post-form";
import { Loader2 } from "lucide-react";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const postData = await PostService.getPost(Number(id));
        setPost(postData);

        // Check if current user is the creator of the post
        if (user?.id !== postData.creator.id) {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      <CreatePostForm postId={post.id} initialContent={post.content} initialImage={post.image} isEdit={true} />
    </div>
  );
}

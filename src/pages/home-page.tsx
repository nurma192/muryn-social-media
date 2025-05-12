"use client";

import { useState, useEffect, useCallback } from "react";
import { PostService } from "@/services/post-service";
import type { Post } from "@/types/api-types";
import PostCard from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use useCallback to memoize the fetchPosts function
  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      if (!append) setIsLoading(true);
      else setIsRefreshing(true);
    } else {
      setIsLoadingMore(true);
    }

    setError(null);

    try {
      const response = await PostService.getAllPosts(pageNum);

      // Validate response structure
      if (!response || !Array.isArray(response.results)) {
        throw new Error("Invalid response format");
      }

      if (append) {
        setPosts(prev => [...prev, ...response.results]);
      } else {
        setPosts(response.results);
      }

      setHasMore(!!response.next);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      setError(error.message || "Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load initial posts on component mount
  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchPosts(1, false);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-gray-500">Loading posts...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Home Feed</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onUpdate={handleRefresh} />
          ))}

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleLoadMore} disabled={isLoadingMore} variant="outline" className="px-6">
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border p-8">
          <p className="text-gray-500 mb-4">No posts found. Follow some users to see their posts!</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Refresh Feed
          </Button>
        </div>
      )}
    </div>
  );
}

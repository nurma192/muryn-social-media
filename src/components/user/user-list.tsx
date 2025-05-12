"use client";

import { useState, useEffect } from "react";
import type { User, PaginatedUserList } from "@/types/api-types";
import UserCard from "./user-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface UserListProps {
  fetchUsers: (page: number) => Promise<PaginatedUserList>;
  emptyMessage: string;
  onFollowChange?: () => void;
}

export default function UserList({ fetchUsers, emptyMessage, onFollowChange }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    setError(null);

    try {
      const response = await fetchUsers(pageNum);

      if (append) {
        setUsers(prev => [...prev, ...response.results]);
      } else {
        setUsers(response.results);
      }

      setHasMore(!!response.next);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, []);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadUsers(nextPage, true);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadUsers(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map(user => (
        <UserCard key={user.id} user={user} onFollowChange={onFollowChange} />
      ))}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleLoadMore} disabled={isLoadingMore} variant="outline">
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
  );
}

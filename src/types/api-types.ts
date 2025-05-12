// User related types
export interface User {
  id: number;
  username: string;
  date_joined: string;
  email: string;
  profile_pic: string | null;
  following: string;
  followers: string;
  cover_pic: string | null;
  is_following: boolean;
  is_followed_by_user?: string;
  is_following_user?: string;
}

export interface Creator {
  id: number;
  username: string;
  email: string;
  profile_pic: string | null;
}

export interface Signup {
  username: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface TokenRefresh {
  refresh: string;
}

export interface TokenBlacklist {
  refresh: string;
}

// Post related types
export interface Post {
  id: number;
  creator: Creator;
  likes: string;
  is_liked: boolean;
  image: string | null;
  content: string;
  created: string;
  comments: string;
  saves: string;
  is_saved: boolean;
  is_commented: string;
  is_following_user: string;
  is_followed_by_user: string;
  isEdited: boolean;
}

export interface CreatePostRequest {
  content: string;
  image?: string | null;
}

export interface UpdatePostRequest {
  content?: string;
  image?: string | null;
  isEdited?: boolean;
}

// Comment related types
export interface Comment {
  id: number;
  creator: Creator;
  created: string;
  post_id: string;
  post_content: string;
  post_creator_profile: string;
  post_creator: string;
  post_created: string;
  content: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type PaginatedUserList = PaginatedResponse<User>;
export type PaginatedPostList = PaginatedResponse<Post>;
export type PaginatedCommentList = PaginatedResponse<Comment>;

import apiClient from "./api-client";
import type { Post, PaginatedPostList, CreatePostRequest, UpdatePostRequest } from "@/types/api-types";

export const PostService = {
  getAllPosts: async (page = 1): Promise<PaginatedPostList> => {
    try {
      const response = await apiClient.get<PaginatedPostList>(`/post/all/?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("API Error in getAllPosts:", error);
      throw error;
    }
  },

  getUserPosts: async (userId: number, page = 1): Promise<PaginatedPostList> => {
    const response = await apiClient.get<PaginatedPostList>(`/post/user/${userId}/all/?page=${page}`);
    return response.data;
  },

  getPost: async (postId: number): Promise<Post> => {
    const response = await apiClient.get<Post>(`/post/${postId}/`);
    return response.data;
  },

  createPost: async (postData: CreatePostRequest): Promise<Post> => {
    const response = await apiClient.post<Post>("/post/create/", postData);
    return response.data;
  },

  // New method for FormData upload
  createPostWithFormData: async (formData: FormData): Promise<Post> => {
    const response = await apiClient.post<Post>("/post/create/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updatePost: async (postId: number, postData: UpdatePostRequest): Promise<Post> => {
    const response = await apiClient.patch<Post>(`/post/update/${postId}/`, postData);
    return response.data;
  },

  // New method for FormData update
  updatePostWithFormData: async (postId: number, formData: FormData): Promise<Post> => {
    const response = await apiClient.patch<Post>(`/post/update/${postId}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/post/delete/${postId}/`);
  },

  likePost: async (postId: number): Promise<void> => {
    await apiClient.post(`/post/${postId}/like/`);
  },

  savePost: async (postId: number): Promise<void> => {
    await apiClient.post(`/post/${postId}/save/`);
  },
};

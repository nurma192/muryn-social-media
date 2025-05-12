import apiClient from "./api-client"
import type { Comment, PaginatedCommentList, CreateCommentRequest, UpdateCommentRequest } from "@/types/api-types"

export const CommentService = {
  getPostComments: async (postId: number, page = 1): Promise<PaginatedCommentList> => {
    const response = await apiClient.get<PaginatedCommentList>(`/post/${postId}/comments/?page=${page}`)
    return response.data
  },

  getAllComments: async (page = 1): Promise<PaginatedCommentList> => {
    const response = await apiClient.get<PaginatedCommentList>(`/post/comments/all/?page=${page}`)
    return response.data
  },

  getComment: async (commentId: number): Promise<Comment> => {
    const response = await apiClient.get<Comment>(`/post/comments/${commentId}/`)
    return response.data
  },

  createComment: async (postId: number, commentData: CreateCommentRequest): Promise<Comment> => {
    const response = await apiClient.post<Comment>(`/post/${postId}/comments/create/`, commentData)
    return response.data
  },

  updateComment: async (commentId: number, commentData: UpdateCommentRequest): Promise<Comment> => {
    const response = await apiClient.patch<Comment>(`/post/comments/update/${commentId}/`, commentData)
    return response.data
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await apiClient.delete(`/post/comments/delete/${commentId}/`)
  },
}

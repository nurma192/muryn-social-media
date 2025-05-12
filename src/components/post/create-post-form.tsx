"use client";

import type React from "react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PostService } from "@/services/post-service";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { change_minio } from "@/lib/utils";

interface CreatePostFormProps {
  postId?: number;
  initialContent?: string;
  initialImage?: string | null;
  isEdit?: boolean;
}

export default function CreatePostForm({ postId, initialContent = "", initialImage = null, isEdit = false }: CreatePostFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialImage);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      content: initialContent,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the file for later upload
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setImageFile(null);
    // Reset the file input
    const fileInput = document.getElementById("image") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = async (data: { content: string }) => {
    if (!data.content.trim() && !previewImage) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData object to properly handle file uploads
      const formData = new FormData();
      formData.append("content", data.content);

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (previewImage === null && initialImage) {
        // If image was removed, send empty value
        formData.append("image", "");
      }

      if (isEdit && postId) {
        formData.append("isEdited", "true");
        await PostService.updatePostWithFormData(postId, formData);
      } else {
        await PostService.createPostWithFormData(formData);
      }
      navigate("/");
    } catch (error: any) {
      console.error("Error creating/updating post:", error);
      setError(error.message || "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Post" : "Create Post"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[120px]"
              {...register("content", {
                required: !previewImage,
                maxLength: {
                  value: 500,
                  message: "Content cannot exceed 500 characters",
                },
              })}
            />
            {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="image" className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <ImageIcon className="h-5 w-5" />
                <span>Add Photo</span>
              </Label>
              <Input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {previewImage && (
              <div className="relative mt-2">
                <img src={`${change_minio(previewImage)}` || "/placeholder.svg"} alt="Preview" className="rounded-md max-h-64 object-cover" />
                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={removeImage}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Updating..." : "Posting..."}
              </>
            ) : isEdit ? (
              "Update Post"
            ) : (
              "Post"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload } from "lucide-react";
import { change_minio } from "@/lib/utils";

interface ProfileFormData {
  username: string;
  email: string;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(user?.profile_pic || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(user?.cover_pic || null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // Create FormData object to properly handle file uploads
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);

      // Add profile pic if changed
      if (profileFile) {
        formData.append("profile_pic", profileFile);
      } else if (profilePreview === null && user?.profile_pic) {
        // If profile pic was removed
        formData.append("profile_pic", "");
      }

      // Add cover pic if changed
      if (coverFile) {
        formData.append("cover_pic", coverFile);
      } else if (coverPreview === null && user?.cover_pic) {
        // If cover pic was removed
        formData.append("cover_pic", "");
      }

      await updateUser(formData);
      setSuccess("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.response?.data) {
        const apiErrors = error.response.data;
        const errorMessages = [];

        if (apiErrors.username) errorMessages.push(`Username: ${apiErrors.username.join(" ")}`);
        if (apiErrors.email) errorMessages.push(`Email: ${apiErrors.email.join(" ")}`);
        if (apiErrors.profile_pic) errorMessages.push(`Profile Picture: ${apiErrors.profile_pic.join(" ")}`);
        if (apiErrors.cover_pic) errorMessages.push(`Cover Photo: ${apiErrors.cover_pic.join(" ")}`);

        setError(errorMessages.join("\n") || "Failed to update profile. Please try again.");
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
              <CardContent className="space-y-6">
                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    {...register("username", {
                      required: "Username is required",
                      pattern: {
                        value: /^[\w.@+-]+$/,
                        message: "Username can only contain letters, numbers, and @/./+/-/_ characters",
                      },
                      maxLength: {
                        value: 150,
                        message: "Username cannot exceed 150 characters",
                      },
                    })}
                  />
                  {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Profile Picture</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={change_minio(profilePreview) || ""} alt={user?.username} />
                        <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <Label htmlFor="profile_pic" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                          <Upload className="h-4 w-4" />
                          <span>Upload</span>
                        </div>
                        <Input id="profile_pic" name="profile_pic" type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label>Cover Photo</Label>
                    <div className="mt-2">
                      {coverPreview ? (
                        <div className="relative h-40 rounded-md overflow-hidden mb-2">
                          <img src={change_minio(coverPreview) || "/placeholder.svg"} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center mb-2">
                          <p className="text-gray-500">No cover photo</p>
                        </div>
                      )}
                      <Label htmlFor="cover_pic" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 w-fit">
                          <Upload className="h-4 w-4" />
                          <span>Upload Cover</span>
                        </div>
                        <Input id="cover_pic" name="cover_pic" type="file" accept="image/*" className="hidden" onChange={handleCoverPicChange} />
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Account settings will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

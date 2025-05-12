"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>();
  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      await signup(data.username, data.email, data.password);
      navigate("/login", { state: { message: "Account created successfully. Please log in." } });
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.response?.data) {
        // Handle API validation errors
        const apiErrors = error.response.data;
        const errorMessages = [];

        if (apiErrors.username) errorMessages.push(`Username: ${apiErrors.username.join(" ")}`);
        if (apiErrors.email) errorMessages.push(`Email: ${apiErrors.email.join(" ")}`);
        if (apiErrors.password) errorMessages.push(`Password: ${apiErrors.password.join(" ")}`);

        setError(errorMessages.join("\n") || "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">Enter your information to create an account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: value => value === password || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

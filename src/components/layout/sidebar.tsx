"use client";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, User, Settings, LogOut } from "lucide-react";
import { change_minio } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className={className}>
      <div className="sticky top-20 space-y-6">
        <div className="flex flex-col items-center p-4 bg-white rounded-lg border">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={change_minio(user?.profile_pic) || ""} alt={user?.username} />
            <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{user?.username}</h2>
          <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
          <div className="flex justify-between w-full text-sm">
            <div className="text-center">
              <p className="font-semibold">{user?.followers}</p>
              <p className="text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{user?.following}</p>
              <p className="text-gray-500">Following</p>
            </div>
          </div>
        </div>

        <nav className="bg-white rounded-lg border p-2">
          <ul className="space-y-1">
            <li>
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link to="/" className="flex items-center">
                  <Home className="mr-2 h-5 w-5" />
                  Home
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link to={`/profile/${user?.id}`} className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </Link>
              </Button>
            </li>

            <li>
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" onClick={handleLogout} asChild className="w-full justify-start">
                <div className="flex items-center cursor-pointer">
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </div>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

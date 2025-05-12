"use client"

import { Outlet } from "react-router-dom"
import Navbar from "./navbar"
import Sidebar from "./sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function Layout() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex gap-6">
        <Sidebar className="hidden md:block w-64 shrink-0" />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

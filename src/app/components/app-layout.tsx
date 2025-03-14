"use client"

import type React from "react"

import { useState } from "react"
import Navbar from "@/app/components/navbar"
import BottomNav from "@/app/components/bottom-nav"
import Sidebar from "@/app/components/sidebar"
import { PostProvider } from "@/lib/post-context"
import { ExpertsProvider } from "@/lib/experts-context"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <PostProvider>
      <ExpertsProvider>
        <div className="flex flex-col min-h-screen relative">
          <Navbar toggleSidebar={toggleSidebar} />
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 pt-16 pb-16">{children}</main>
          <BottomNav />
        </div>
      </ExpertsProvider>
    </PostProvider>
  )
}


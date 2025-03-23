"use client"

import type React from "react"

import Navbar from "@/app/components/navbar"
import BottomNav from "@/app/components/bottom-nav"
import { PostProvider } from "@/lib/post-context"
import { ExpertsProvider } from "@/lib/experts-context"

export default function AppLayout({ children }: { children: React.ReactNode }) {


  return (
    <PostProvider>
      <ExpertsProvider>
        <div className="flex flex-col min-h-screen relative">
          <Navbar/>
          <main className="flex-1 pt-16 pb-16">{children}</main>
          <BottomNav />
        </div>
      </ExpertsProvider>
    </PostProvider>
  )
}


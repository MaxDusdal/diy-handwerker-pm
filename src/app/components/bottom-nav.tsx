import Link from "next/link"
import { Home, Search, MessageCircle, Briefcase } from "lucide-react"

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background z-10">
      <div className="container h-full flex items-center justify-between px-4">
        <Link href="/" className="flex flex-col items-center justify-center flex-1">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link href="/search" className="flex flex-col items-center justify-center flex-1">
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">DIY Anleitungen</span>
        </Link>

        <Link href="/chat" className="flex flex-col items-center justify-center flex-1">
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Chat</span>
        </Link>

        <Link href="/expert" className="flex flex-col items-center justify-center flex-1">
          <Briefcase className="h-6 w-6" />
          <span className="text-xs mt-1">Expert</span>
        </Link>
      </div>
    </nav>
  )
}


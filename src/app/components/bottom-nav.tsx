import Link from "next/link"
import { Home, Search, MessageCircle, Briefcase } from "lucide-react"
import { usePathname } from "next/navigation";
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background z-10">
      <div className="container h-full flex items-center justify-between px-4">
        <Link href="/" className={`flex flex-col items-center justify-center flex-1 ${pathname === '/' ? 'text-primary font-bold' : ''}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link href="/search" className={`flex flex-col items-center justify-center flex-1 ${pathname === '/search' ? 'text-primary font-bold' : ''}`}>
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Anleitungen</span>
        </Link>

        <Link href="/chat" className={`flex flex-col items-center justify-center flex-1 ${pathname === '/chat' ? 'text-primary font-bold' : ''}`}>
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Chat</span>
        </Link>

        <Link href="/expert" className={`flex flex-col items-center justify-center flex-1 ${pathname === '/expert' ? 'text-primary font-bold' : ''}`}>
          <Briefcase className="h-6 w-6"  /> 
          <span className="text-xs mt-1">Experte</span>
        </Link>
      </div>
    </nav>
  )
}


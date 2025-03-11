import Link from "next/link"
import { Inbox, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ResetDataButton from "./reset-data-button"

interface NavbarProps {
  toggleSidebar: () => void
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-10">
      <div className="container h-full flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>

        <div className="flex items-center gap-4">
          <ResetDataButton />
          
          <Button variant="ghost" size="icon" asChild>
            <Link href="#">
              <Inbox className="h-6 w-6" />
              <span className="sr-only">Inbox</span>
            </Link>
          </Button>

          <Link href="#">
            <Avatar>
              <AvatarImage src="https://avatar.iran.liara.run/public/100" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  )
}


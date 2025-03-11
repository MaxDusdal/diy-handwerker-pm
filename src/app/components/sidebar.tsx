import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`absolute top-0 left-0 h-full w-[280px] bg-background shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="block p-2 hover:bg-muted rounded-md">
                Home
              </Link>
            </li>
            <li>
              <Link href="/search" className="block p-2 hover:bg-muted rounded-md">
                DIY Anleitungen
              </Link>
            </li>
            <li>
              <Link href="#" className="block p-2 hover:bg-muted rounded-md">
                Profile
              </Link>
            </li>
            <li>
              <Link href="#" className="block p-2 hover:bg-muted rounded-md">
                Settings
              </Link>
            </li>
            <li>
              <Link href="#" className="block p-2 hover:bg-muted rounded-md">
                Help
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}


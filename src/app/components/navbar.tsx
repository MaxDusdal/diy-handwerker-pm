import Link from "next/link";
import { Inbox, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ResetDataButton from "./reset-data-button";

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-10 h-16 border-b bg-background">
      <div className="container flex h-full items-center justify-between px-4">
        <div></div>

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
              <AvatarImage
                src="https://avatar.iran.liara.run/public/100"
                alt="User"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client"

import { useState } from "react";
import { usePosts } from "@/lib/post-context";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { RefreshCcw } from "lucide-react";

export default function ResetDataButton() {
  const [open, setOpen] = useState(false);
  const { resetPosts } = usePosts();

  const handleReset = () => {
    resetPosts();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <RefreshCcw className="h-4 w-4" />
          <span className="sr-only">Reset data</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset all data?</AlertDialogTitle>
          <AlertDialogDescription>
            Dies löscht alle deine Beiträge, Kommentare und Likes, die du hinzugefügt hast und stellt die ursprünglichen Daten wieder her. Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>Zurücksetzen</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 
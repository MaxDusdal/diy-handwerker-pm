"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MessageCircle,
  Heart,
  Share2,
  BookmarkPlus,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CreatePostSheet from "@/app/components/create-post-sheet";
import { usePosts } from "@/lib/post-context";
import { formatTimeAgo } from "@/lib/utils";


const categories = [
  "Alle",
  "Sanitär",
  "Elektrik",
  "Innenausbau",
  "Außenbereich",
  "Zimmerei",
  "Malerei",
  "Heizung/Klima",
];

export default function Home() {
  const router = useRouter();
  const { posts, toggleLike } = usePosts();
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const filteredPosts =
    selectedCategory === "Alle"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  const navigateToPost = (postId: number) => {
    router.push(`/post/${postId}`);
  };

  return (
    <div className="flex min-h-screen flex-col pb-16">
      {/* Categories */}
      <div className="bg-background sticky top-16 z-10 border-b">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto p-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Kategorien</SheetTitle>
              </SheetHeader>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    className="justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 space-y-4 p-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader 
              className="space-y-4 cursor-pointer" 
              onClick={() => navigateToPost(post.id)}
            >
              <div className="flex items-start gap-2">
                <Avatar>
                  <AvatarImage
                    src={post.author.avatar}
                    alt={post.author.name}
                  />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{post.author.name}</span>
                    <span className="text-muted-foreground text-xs">
                      • {formatTimeAgo(new Date(post.timestamp))}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={post.type === "help" ? "destructive" : "default"}
                    >
                      {post.type === "help" ? "Hilfe benötigt" : "Präsentation"}
                    </Badge>
                    <Badge variant="outline">{post.category}</Badge>
                    {post.urgency && (
                      <Badge variant="secondary">Dringlichkeit: {post.urgency}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{post.title}</h2>
                <p className="text-muted-foreground mt-1">{post.content}</p>
              </div>
            </CardHeader>

            {post.images && post.images.length > 0 && (
              <CardContent 
                className="p-0 cursor-pointer"
                onClick={() => navigateToPost(post.id)}
              >
                <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto">
                  {post.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-full flex-none snap-center first:pl-4 last:pr-4"
                    >
                      <img
                        src={image ?? "/placeholder.svg"}
                        alt={`Beitragsbild ${index + 1}`}
                        className="h-64 w-full rounded-md object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}

            <CardFooter className="p-4">
              <div className="flex w-full items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toggleLike(post.id)}
                >
                  {post.liked ? (
                    <Heart className="mr-2 h-4 w-4 fill-current text-red-500" />
                  ) : (
                    <Heart className="mr-2 h-4 w-4" />
                  )}
                  {post.likes}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => navigateToPost(post.id)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Teilen
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  Speichern
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Post FAB */}
      <Button
        onClick={() => setIsCreatePostOpen(true)}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Beitrag erstellen</span>
      </Button>

      {/* Create Post Sheet */}
      <CreatePostSheet
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      />
    </div>
  );
}

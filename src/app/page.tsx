"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MessageCircle,
  Heart,
  Share2,
  BookmarkPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
} from "@/components/ui/card";
import CreatePostSheet from "@/app/components/create-post-sheet";
import { usePosts } from "@/lib/post-context";
import { formatTimeAgo } from "@/lib/utils";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { posts, toggleLike } = usePosts();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const filteredPosts = posts;

  const navigateToPost = (postId: number) => {
    router.push(`/post/${postId}`);
  };

  return (
    <div className="flex min-h-screen flex-col pb-16">
      <div className="flex-1 space-y-6 p-4">
        {filteredPosts.map((post) => (
          <Card 
            key={post.id} 
            className="relative overflow-hidden rounded-xl shadow-md"
            onClick={() => navigateToPost(post.id)}
          >
            <div className="relative aspect-[4/5] w-full cursor-pointer">
              {post.images && post.images.length > 0 ? (
                <Image
                  src={post.images[0] ?? "/placeholder.svg"}
                  alt={`Bild zu ${post.title}`}
                  className="h-full w-full object-cover"
                  fill
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                  <p className="p-4 text-center text-xl font-semibold text-muted-foreground">{post.title}</p>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            </div>

            <div className="absolute left-0 right-0 top-0 p-4 z-10">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-white drop-shadow-sm">{post.author.name}</span>
                <span className="text-xs text-white/80">
                  • {formatTimeAgo(new Date(post.timestamp))}
                </span>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={post.type === "help" ? "destructive" : "default"}
                    className="bg-opacity-70 backdrop-blur-sm"
                  >
                    {post.type === "help" ? "Hilfe benötigt" : "Präsentation"}
                  </Badge>
                  <Badge variant="outline" className="bg-black/30 backdrop-blur-sm text-white border-white/40">
                    {post.category}
                  </Badge>
                  {post.urgency && (
                    <Badge variant="secondary" className="backdrop-blur-sm">
                      Dringlichkeit: {post.urgency}
                    </Badge>
                  )}
                </div>
                
                <h2 className="text-lg font-bold text-white drop-shadow-sm">{post.title}</h2>
                <p className="line-clamp-2 text-white/90 text-sm">{post.content}</p>
                
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(post.id);
                    }}
                  >
                    {post.liked ? (
                      <Heart className="mr-1 h-4 w-4 fill-current text-red-500" />
                    ) : (
                      <Heart className="mr-1 h-4 w-4 text-white" />
                    )}
                    <span className="text-xs">{post.likes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToPost(post.id);
                    }}
                  >
                    <MessageCircle className="mr-1 h-4 w-4 text-white" />
                    <span className="text-xs">{post.comments}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Share2 className="mr-1 h-4 w-4 text-white" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <BookmarkPlus className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={() => setIsCreatePostOpen(true)}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-white"
      >
        <Plus className="h-6 w-6 text-black" />
        <span className="sr-only">Beitrag erstellen</span>
      </Button>

      <CreatePostSheet
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      />
    </div>
  );
}

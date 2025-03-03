"use client";

import { useState } from "react";
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

// Mock data for posts
const posts = [
  {
    id: 1,
    type: "help",
    title: "Need help with bathroom renovation",
    content:
      "I'm trying to renovate my bathroom but having issues with the tile layout. Any experts who can give advice on the best approach?",
    category: "Plumbing",
    images: ["/placeholder.svg?height=300&width=400"],
    author: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8,
    urgency: "High",
  },
  {
    id: 2,
    type: "showcase",
    title: "Kitchen Remodel Complete!",
    content:
      "Just finished this kitchen remodel project. Took 6 weeks but the results are amazing. Swipe to see before and after!",
    category: "Interior",
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    author: {
      name: "Sarah Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: "5 hours ago",
    likes: 156,
    comments: 32,
  },
  {
    id: 3,
    type: "help",
    title: "Electric outlet not working",
    content:
      "The outlet in my living room suddenly stopped working. Already checked the breaker. Any ideas what could be wrong?",
    category: "Electrical",
    author: {
      name: "Mike Brown",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: "1 day ago",
    likes: 12,
    comments: 15,
    urgency: "Medium",
  },
  {
    id: 4,
    type: "showcase",
    title: "DIY Backyard Fire Pit",
    content:
      "Built this fire pit over the weekend. Total cost was under $200. Here's how I did it!",
    category: "Outdoor",
    images: ["/placeholder.svg?height=300&width=400"],
    author: {
      name: "Emily Chen",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: "2 days ago",
    likes: 89,
    comments: 24,
  },
];

const categories = [
  "All",
  "Plumbing",
  "Electrical",
  "Interior",
  "Outdoor",
  "Carpentry",
  "Painting",
  "HVAC",
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

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
                <SheetTitle>Categories</SheetTitle>
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
            <CardHeader className="space-y-4">
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
                      • {post.timestamp}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={post.type === "help" ? "destructive" : "default"}
                    >
                      {post.type === "help" ? "Help Needed" : "Showcase"}
                    </Badge>
                    <Badge variant="outline">{post.category}</Badge>
                    {post.urgency && (
                      <Badge variant="secondary">Urgency: {post.urgency}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{post.title}</h2>
                <p className="text-muted-foreground mt-1">{post.content}</p>
              </div>
            </CardHeader>

            {post.images && (
              <CardContent className="p-0">
                <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto">
                  {post.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-full flex-none snap-center first:pl-4 last:pr-4"
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Post image ${index + 1}`}
                        className="h-64 w-full rounded-md object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}

            <CardFooter className="p-4">
              <div className="flex w-full items-center gap-4">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Heart className="mr-2 h-4 w-4" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  Save
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
        <span className="sr-only">Create Post</span>
      </Button>

      {/* Create Post Sheet */}
      <CreatePostSheet
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      />
    </div>
  );
}

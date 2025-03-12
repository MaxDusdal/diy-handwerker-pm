"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  BookmarkPlus,
  MoreVertical,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTimeAgo } from "@/lib/utils";
import { usePosts } from "@/lib/post-context";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export default function PostDetail() {
  const router = useRouter();
  const params = useParams();
  const { getPost, addComment, toggleLike } = usePosts();

  const [post, setPost] = useState<ReturnType<typeof getPost>>(undefined);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplyingTo, setIsReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isAiResponseExpanded, setIsAiResponseExpanded] = useState(false);

  // Fetch post data based on ID
  useEffect(() => {
    if (params?.id) {
      const postId = Number(params.id);
      if (!isNaN(postId)) {
        const foundPost = getPost(postId);
        if (foundPost) {
          setPost(foundPost);
        } else {
          // Post not found, redirect to home
          router.push("/");
        }
      }
    }
  }, [params?.id, getPost, router]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim()) return;

    setIsSubmitting(true);
    
    // Add comment
    addComment(post.id, {
      content: newComment,
      author: {
        name: "Current User",
        avatar: "https://avatar.iran.liara.run/public/99",
        expertise: "Member",
      },
    });

    setNewComment("");
    setIsSubmitting(false);
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!post || !replyContent.trim()) return;

    // Add reply
    const postId = post.id;
    
    // Add comment
    addComment(post.id, {
      content: replyContent,
      author: {
        name: "Current User",
        avatar: "https://avatar.iran.liara.run/public/99",
        expertise: "Member",
      },
    });
    
    setReplyContent("");
    setIsReplyingTo(null);
  };

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Handle case where post is undefined or not yet loaded
  if (!post) {
    return <div className="p-4">Loading...</div>;
  }

  // Safe to use post properties now with type assertions
  const aiResponseText = (post.aiResponse as string) || "";
  const showExpandButton = aiResponseText.length > 300;

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-background">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <BookmarkPlus className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Beitrag melden</DropdownMenuItem>
                <DropdownMenuItem>Link kopieren</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">{post.author.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {post.author.expertise}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatTimeAgo(new Date(post.timestamp))}
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <Badge variant={post.type === "help" ? "destructive" : "default"}>
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
          <h1 className="mb-2 text-xl font-bold">{post.title}</h1>
          <p className="whitespace-pre-line text-muted-foreground">
            {post.content}
          </p>
        </div>

        {/* AI Response Section */}
        {post.aiResponse && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 p-4 my-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-medium text-blue-600 dark:text-blue-400">KI-Vorschlag</h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight, rehypeSanitize]}
                remarkPlugins={[remarkGfm]}
              >
                {isAiResponseExpanded 
                  ? aiResponseText 
                  : truncateText(aiResponseText, 300)}
              </ReactMarkdown>
              
              {showExpandButton && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAiResponseExpanded(!isAiResponseExpanded)}
                  className="mt-2 text-blue-600 dark:text-blue-400 flex items-center gap-1"
                >
                  {isAiResponseExpanded ? (
                    <>
                      Weniger anzeigen <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Mehr lesen <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Image Gallery */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.images.map((image, index) => (
              <div
                key={index}
                className={`relative cursor-pointer ${index === 0 && post.images!.length === 3 ? "col-span-2" : ""}`}
                onClick={() => {
                  setSelectedImageIndex(index);
                  setImageViewerOpen(true);
                }}
              >
                <Image
                  src={image ?? "/placeholder.svg"}
                  alt={`Post image ${index + 1}`}
                  className="h-48 w-full rounded-lg object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between border-y py-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => toggleLike(post.id)}
          >
            <Heart className="mr-2 h-4 w-4" />
            {post.likes} Likes
          </Button>
          <Button variant="ghost" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            {post.commentsList?.length ?? 0} Kommentare
          </Button>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <Textarea
            placeholder="Kommentar hinzufügen..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[44px] resize-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newComment.trim() || isSubmitting}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Comments Section */}
        <div className="space-y-4">
          {post.commentsList && post.commentsList.length > 0 ? (
            post.commentsList.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage
                      src={comment.author.avatar}
                      alt={comment.author.name}
                    />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-semibold">
                          {comment.author.name}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {comment.author.expertise}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(new Date(comment.timestamp))}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        <Heart className="mr-1 h-3 w-3" />
                        {comment.likes}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (isReplyingTo === comment.id) {
                            setIsReplyingTo(null);
                          } else {
                            setIsReplyingTo(comment.id);
                            setReplyContent("");
                          }
                        }}
                      >
                        Antworten
                      </Button>
                    </div>

                    {/* Reply Form */}
                    {isReplyingTo === comment.id && (
                      <div className="mt-2 flex gap-2">
                        <Textarea
                          placeholder="Auf diesen Kommentar antworten..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[44px] resize-none"
                        />
                        <Button
                          size="icon"
                          disabled={!replyContent.trim()}
                          onClick={() => handleSubmitReply(comment.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4 border-l pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={reply.author.avatar}
                                alt={reply.author.name}
                              />
                              <AvatarFallback>
                                {reply.author.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="font-semibold">
                                    {reply.author.name}
                                  </span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {reply.author.expertise}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(new Date(reply.timestamp))}
                                </span>
                              </div>
                              <p className="text-sm">{reply.content}</p>
                              <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm">
                                  <Heart className="mr-1 h-3 w-3" />
                                  {reply.likes}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">Noch keine Kommentare. Sei der Erste!</p>
          )}
        </div>
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="h-[90vh] max-w-full p-0">
          <ScrollArea className="h-full">
            <div className="relative h-full w-full">
              <img
                src={post.images?.[selectedImageIndex] ?? "/placeholder.svg"}
                alt={`Post image ${selectedImageIndex + 1}`}
                className="h-auto w-full"
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

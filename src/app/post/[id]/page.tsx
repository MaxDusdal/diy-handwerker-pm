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

  useEffect(() => {
    if (params?.id) {
      const postId = Number(params.id);
      if (!isNaN(postId)) {
        const foundPost = getPost(postId);
        if (foundPost) {
          setPost(foundPost);
        } else {
          router.push("/");
        }
      }
    }
  }, [params?.id, getPost, router]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim()) return;

    setIsSubmitting(true);
    
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

  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!post) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const aiResponseText = post.aiResponse! || "";
  const showExpandButton = aiResponseText.length > 300;
  const hasImage = post.images && post.images.length > 0;

  return (
    <div className="min-h-screen pb-16 bg-background">
      <div className="sticky top-0 z-20 backdrop-blur-md bg-background/80 border-b">
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

      <div className="relative">
        <div className="relative h-[350px] w-full md:h-[400px]">
          {hasImage && post.images && post.images.length > 0 ? (
            <Image
              src={post.images[0] ?? "/placeholder.svg"}
              alt={post.title}
              className="h-full w-full object-cover"
              fill
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-primary/20 to-background" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{post.author.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{post.author.expertise}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(new Date(post.timestamp))}</span>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{post.title}</h1>
            </div>

            <div className="flex flex-wrap gap-2">
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
      </div>

      <div className="space-y-4 px-4 pt-4">
        <div className="mt-4">
          <p className="whitespace-pre-line text-muted-foreground">
            {post.content}
          </p>
        </div>

        {post.aiResponse && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30 p-4 my-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
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

        {post.images && post.images.length > 1 && (
          <div className="grid grid-cols-2 gap-2 my-4">
            {post.images.slice(1).map((image, index) => (
              <div
                key={index + 1}
                className="relative cursor-pointer overflow-hidden rounded-xl"
                onClick={() => {
                  setSelectedImageIndex(index + 1); // +1 since we're starting from the second image
                  setImageViewerOpen(true);
                }}
              >
                <Image
                  src={image ?? "/placeholder.svg"}
                  alt={`Post image ${index + 2}`}
                  className="h-48 w-full object-cover transition-transform hover:scale-105"
                  width={400}
                  height={400}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-y py-3 my-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => toggleLike(post.id)}
            className="rounded-full"
          >
            {post.liked ? (
              <Heart className="mr-2 h-4 w-4 fill-current text-red-500" />
            ) : (
              <Heart className="mr-2 h-4 w-4" />
            )}
            {post.likes} Likes
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full">
            <MessageCircle className="mr-2 h-4 w-4" />
            {post.commentsList?.length ?? 0} Kommentare
          </Button>
        </div>

        <form onSubmit={handleSubmitComment} className="flex gap-2 my-4">
          <Textarea
            placeholder="Kommentar hinzufügen..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[48px] resize-none rounded-full px-4 py-3"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newComment.trim() || isSubmitting}
            className="rounded-full h-12 w-12 flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>

        <div className="space-y-6 py-2">
          <h3 className="font-semibold text-lg">Kommentare</h3>
          
          {post.commentsList && post.commentsList.length > 0 ? (
            post.commentsList.map((comment) => (
              <div key={comment.id} className="space-y-4 rounded-xl border border-border/40 p-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage
                      src={comment.author.avatar}
                      alt={comment.author.name}
                    />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
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
                      <Button variant="ghost" size="sm" className="h-8 rounded-full">
                        <Heart className="mr-1 h-3 w-3" />
                        {comment.likes}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 rounded-full"
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

                    {isReplyingTo === comment.id && (
                      <div className="mt-3 flex gap-2">
                        <Textarea
                          placeholder="Auf diesen Kommentar antworten..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[44px] resize-none rounded-full px-4 py-2"
                        />
                        <Button
                          size="icon"
                          className="rounded-full h-10 w-10"
                          disabled={!replyContent.trim()}
                          onClick={() => handleSubmitReply(comment.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4 rounded-lg bg-muted/30 p-3">
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
                                <Button variant="ghost" size="sm" className="h-7 px-2 rounded-full">
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
            <div className="rounded-xl border border-dashed p-8 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/70 mb-2" />
              <p className="text-muted-foreground">Noch keine Kommentare. Sei der Erste!</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="h-[90vh] max-w-full p-0 border-none">
          <ScrollArea className="h-full">
            <div className="relative h-full w-full bg-black/95">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-4 top-4 z-50 rounded-full bg-black/50 text-white"
                onClick={() => setImageViewerOpen(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Image
                src={post.images?.[selectedImageIndex] ?? "/placeholder.svg"}
                alt={`Post image ${selectedImageIndex + 1}`}
                className="h-auto w-full object-contain"
                width={1200}
                height={1200}
                priority
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

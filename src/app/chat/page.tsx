"use client";

import { useState, useEffect } from "react";
import { Send, Bot, User2, Clock, Star, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import "highlight.js/styles/github-dark.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useExperts, ExpertMessage } from "@/lib/experts-context";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CheckCircle2, XCircle } from "lucide-react";

interface StreamResponse {
  chunk?: string;
  fullText?: string;
  error?: string;
}

export default function ChatPage() {
  const {
    activeThread,
    setActiveThread,
    threads,
    sendMessageToExpert,
    hasUnreadMessages,
    markThreadAsRead,
    resetAIChat,
    updateThreads,
  } = useExperts();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  // Check URL for expert ID
  useEffect(() => {
    // Only reset AI chat, but don't change activeThread if there's already one set
    // This ensures when coming from "Contact Expert", we preserve that thread
    resetAIChat();

    // If no active thread is set, default to AI
    if (!activeThread) {
      setActiveThread("ai");
    }

    // If we came from the expert page via "contact expert",
    // the thread would already be set before navigating here
  }, [resetAIChat, setActiveThread, activeThread]);

  // Handle responsive view
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      setShowChatList(isMobile ? !activeThread : true);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [activeThread]);

  // When selecting a thread on mobile, hide the chat list
  useEffect(() => {
    if (isMobileView && activeThread) {
      setShowChatList(false);
    }
  }, [isMobileView, activeThread]);

  // Reset AI chat on initial load
  useEffect(() => {
    if (!initialLoadDone) {
      resetAIChat();
      setInitialLoadDone(true);
    }
  }, [resetAIChat, initialLoadDone]);

  // Mark messages as read when switching to a thread, but with debounce to prevent infinite loops
  useEffect(() => {
    if (!activeThread || !initialLoadDone) return;

    const timer = setTimeout(() => {
      if (hasUnreadMessages(activeThread)) {
        markThreadAsRead(activeThread);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [activeThread, markThreadAsRead, hasUnreadMessages, initialLoadDone]);

  const handleSendMessage = async () => {
    if (!input.trim() || !activeThread) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      if (activeThread === "ai") {
        // Handle AI message differently with streaming
        await sendMessageToAI(userMessage);
      } else {
        // This is an expert thread
        await sendMessageToExpert(activeThread, userMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to AI with streaming
  const sendMessageToAI = async (message: string) => {
    try {
      // Add the user message to the threads state
      const updatedMessages = [
        ...threads.ai!.messages,
        {
          role: "user" as const,
          content: message,
          timestamp: new Date(),
          read: true,
        },
      ];

      // Add temporary assistant message for streaming
      const tempMessages = [
        ...updatedMessages,
        {
          role: "assistant" as const,
          content: "",
          timestamp: new Date(),
          read: true,
        },
      ];

      // First, update with empty assistant message (will be filled by stream)
      const tempThread = {
        ...threads.ai!,
        messages: tempMessages,
        lastUpdated: new Date(),
      };

      // Use the experts context to update state
      setActiveThread("ai");
      updateThreads({
        ...threads,
        ai: tempThread,
      });

      // Send to the API using streaming - only send the current message
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error?.error ?? "Failed to get a response");
      }

      // Handle the stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream available");

      const decoder = new TextDecoder();
      let done = false;
      let fullText = ""; // Track the complete response
      let partialChunk = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (done) break;

        const text = decoder.decode(value);
        const lines = (partialChunk + text).split("\n\n");
        partialChunk = lines.pop() ?? "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine?.startsWith("data: ")) {
            const data = trimmedLine.slice(6);

            if (data === "[DONE]") {
              // Stream is done
              continue;
            }

            try {
              const parsedData = JSON.parse(data) as StreamResponse;

              if (parsedData?.error) {
                throw new Error(parsedData.error);
              }

              if (parsedData.fullText) {
                fullText = parsedData.fullText;
              } else if (parsedData.chunk) {
                fullText += parsedData.chunk;
              }

              // Update the last message content with the current fullText
              const newMessages = [...updatedMessages];

              // Add or update the assistant message
              newMessages.push({
                role: "assistant" as const,
                content: fullText,
                timestamp: new Date(),
                read: true,
              });

              // Update the threads state with the new messages
              const updatedAiThread = {
                ...threads.ai!,
                messages: newMessages,
                lastUpdated: new Date(),
              };

              updateThreads({
                ...threads,
                ai: updatedAiThread,
              });
            } catch (e) {
              console.error("Error parsing streaming data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message to AI:", error);
      // Add error message
      const updatedMessages = [
        ...threads.ai!.messages,
        {
          role: "assistant" as const,
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
          read: true,
        },
      ];

      const errorThread = {
        ...threads.ai!,
        messages: updatedMessages,
        lastUpdated: new Date(),
      };

      updateThreads({
        ...threads,
        ai: errorThread,
      });
    }
  };

  // Helper function to format timestamps
  const formatTimestamp = (date: Date) => {
    return format(date, "HH:mm", { locale: de });
  };

  // Helper function to get last message preview
  const getLastMessagePreview = (threadId: string) => {
    const thread = threads[threadId];
    if (!thread || thread.messages.length === 0) return "";

    const lastMessage = thread.messages[thread.messages.length - 1];
    if (!lastMessage) return "";

    const preview = lastMessage.content.substring(0, 30);
    return preview.length < lastMessage.content.length
      ? `${preview}...`
      : preview;
  };

  // Get current thread messages
  const currentMessages = activeThread
    ? (threads[activeThread]?.messages ?? [])
    : [];

  // Get current thread details
  const currentExpert =
    activeThread && activeThread !== "ai"
      ? threads[activeThread]?.expert
      : null;

  // Handler for back button on mobile
  const handleBackToList = () => {
    setShowChatList(true);
  };

  // Handler for selecting a chat
  const handleSelectChat = (threadId: string) => {
    setActiveThread(threadId);
    if (isMobileView) {
      setShowChatList(false);
    }
  };

  // Add PaymentRequest component
  function PaymentRequest({ paymentDetails }: { paymentDetails: NonNullable<ExpertMessage["paymentDetails"]> }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<"pending" | "paid" | "cancelled">(paymentDetails.status);

    const handlePayment = async () => {
      setIsProcessing(true);
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus("paid");
      setIsProcessing(false);
    };

    const handleCancel = async () => {
      setIsProcessing(true);
      // Simulate cancellation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus("cancelled");
      setIsProcessing(false);
    };

    if (status === "paid") {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          <span>Zahlung erfolgreich</span>
        </div>
      );
    }

    if (status === "cancelled") {
      return (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <XCircle className="h-5 w-5" />
          <span>Zahlung abgebrochen</span>
        </div>
      );
    }

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Zahlungsanfrage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Betrag:</span>
              <span className="font-medium">{paymentDetails.amount}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Beschreibung:</span>
              <span className="font-medium">{paymentDetails.description}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={handlePayment}
            disabled={isProcessing}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Jetzt bezahlen
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Abbrechen
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Main layout
  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Chat List Sidebar */}
      {(showChatList || !isMobileView) && (
        <div
          className={cn(
            "flex flex-col border-r",
            isMobileView ? "w-full" : "w-80",
          )}
        >
          <div className="border-b p-4">
            <h1 className="text-xl font-bold">Chats</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* AI Chat */}
            <button
              className={cn(
                "flex w-full items-center gap-3 border-b p-3 text-left hover:bg-muted/50",
                activeThread === "ai" && !showChatList ? "bg-muted" : "",
              )}
              onClick={() => handleSelectChat("ai")}
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                KI
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate font-medium">KI Helfer</p>
                  {threads.ai?.lastUpdated && (
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(threads.ai.lastUpdated)}
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {getLastMessagePreview("ai")}
                </p>
              </div>
              {hasUnreadMessages("ai") && (
                <Badge className="ml-auto" variant="default">
                  Neu
                </Badge>
              )}
            </button>

            {/* Expert Chats */}
            {Object.entries(threads)
              .filter(([id, thread]) => id !== "ai" && thread.expert)
              .map(([id, thread]) => (
                <button
                  key={id}
                  className={cn(
                    "flex w-full items-center gap-3 border-b p-3 text-left hover:bg-muted/50",
                    activeThread === id && !showChatList ? "bg-muted" : "",
                  )}
                  onClick={() => handleSelectChat(id)}
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage
                      src={thread.expert?.profileImage}
                      alt={thread.expert?.name}
                    />
                    <AvatarFallback>
                      {thread.expert?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate font-medium">
                        {thread.expert?.name}
                      </p>
                      {thread.lastUpdated && (
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(thread.lastUpdated)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {thread.expert?.specialty}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <p className="flex-1 truncate text-sm text-muted-foreground">
                        {getLastMessagePreview(id)}
                      </p>
                    </div>
                  </div>
                  {hasUnreadMessages(id) && (
                    <Badge className="ml-auto" variant="default">
                      Neu
                    </Badge>
                  )}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Chat View */}
      {(!showChatList || !isMobileView) && activeThread && (
        <div className="flex flex-1 flex-col">
          {/* Chat header with avatar and info */}
          <div className="border-b bg-background p-4">
            <div className="flex items-center gap-4">
              {isMobileView && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-1"
                  onClick={handleBackToList}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}

              {activeThread === "ai" ? (
                <>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                    KI
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">KI Helfer</h2>
                    <p className="text-sm text-muted-foreground">
                      Ihr DIY und Handwerker Helfer
                    </p>
                  </div>
                </>
              ) : currentExpert ? (
                <>
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage
                      src={currentExpert.profileImage}
                      alt={currentExpert.name}
                    />
                    <AvatarFallback className="text-lg">
                      {currentExpert.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-lg font-medium">
                        {currentExpert.name}
                      </h2>
                      <Badge variant="outline">{currentExpert.specialty}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>
                          {currentExpert.rating} ({currentExpert.ratingCount})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{currentExpert.availability}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {currentMessages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-full items-start gap-3",
                  message.role === "user" ? "justify-end" : "",
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    {activeThread === "ai" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                        KI
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={threads[activeThread]?.expert?.profileImage}
                          alt={threads[activeThread]?.expert?.name}
                        />
                        <AvatarFallback>
                          {threads[activeThread]?.expert?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.role === "assistant"
                      ? "bg-muted text-foreground"
                      : "ml-auto bg-primary text-primary-foreground",
                  )}
                >
                  {message.role === "user" ? (
                    <p>{message.content}</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="markdown-content prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          rehypePlugins={[rehypeHighlight, rehypeSanitize]}
                          remarkPlugins={[remarkGfm]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {message.type === "payment_request" && message.paymentDetails && (
                        <PaymentRequest paymentDetails={message.paymentDetails} />
                      )}
                    </div>
                  )}
                  <div className="mt-1 text-right text-xs opacity-70">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {activeThread === "ai" ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={threads[activeThread]?.expert?.profileImage}
                        alt={threads[activeThread]?.expert?.name}
                      />
                      <AvatarFallback>
                        <User2 className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="rounded-2xl bg-muted px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40"></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t bg-background p-3">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendMessage();
              }}
            >
              <Textarea
                placeholder={`Nachricht an ${activeThread === "ai" ? "KI Helfer" : (threads[activeThread]?.expert?.name ?? "Experte")}...`}
                className="min-h-[44px] resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Nachricht senden</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

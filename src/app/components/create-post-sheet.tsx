"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Loader2, ArrowRight, CheckCircle, Send, MessageSquareHeart, CircleHelp, Star, MapPin, Clock, ArrowLeft } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePosts } from "@/lib/post-context"
import { useExperts } from "@/lib/experts-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface CreatePostSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreatePostSheet({ open, onOpenChange }: CreatePostSheetProps) {
  const router = useRouter()
  const { addPost } = usePosts()
  const { getExpertsByCategory, startExpertChat, experts } = useExperts()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingAIResponse, setIsLoadingAIResponse] = useState(false)
  const [postType, setPostType] = useState<"help" | "showcase">("help")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [urgency, setUrgency] = useState<string | undefined>(undefined)
  const [aiResponse, setAiResponse] = useState("")
  const [availableExperts, setAvailableExperts] = useState<typeof experts>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Add post to context
    addPost({
      type: postType,
      title,
      content,
      category,
      urgency,
      images: selectedImages.length > 0 ? selectedImages : undefined,
      author: {
        name: "Maria Hartmann",
        avatar: "https://avatar.iran.liara.run/public/99",
        expertise: "Member",
      },
    })

    // Reset form
    resetForm()
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const resetForm = () => {
    setStep(1)
    setTitle("")
    setContent("")
    setCategory("")
    setUrgency(undefined)
    setSelectedImages([])
    setPostType("help")
    setAiResponse("")
    setAvailableExperts([])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // In a real app, you would upload these files to your storage
      // For now, we'll just create object URLs
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setSelectedImages((prev) => [...prev, ...newImages])
    }
  }

  const handleAskAI = async () => {
    if (!title || !content) return

    setIsLoadingAIResponse(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Title: ${title}\n\nProblem: ${content}\n\n${category ? `Category: ${category}` : ""}\n\n${urgency ? `Urgency: ${urgency}` : ""}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream available");

      const decoder = new TextDecoder();
      let done = false;
      let fullText = "";
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
              continue;
            }
            
            try {
              interface StreamResponse {
                chunk?: string;
                fullText?: string;
                error?: string;
                details?: string;
              }
              
              const parsedData = JSON.parse(data) as StreamResponse;
              
              if (parsedData.error) {
                throw new Error(parsedData.error);
              }
              
              if (parsedData.fullText) {
                fullText = parsedData.fullText;
                setAiResponse(fullText);
              } else if (parsedData.chunk) {
                fullText += parsedData.chunk;
                setAiResponse(fullText);
              }
            } catch (e) {
              console.error("Error parsing streaming data:", e);
            }
          }
        }
      }

      setStep(2);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setAiResponse("Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten. Bitte versuchen Sie, Ihre Frage an die Community zu stellen.");
    } finally {
      setIsLoadingAIResponse(false);
    }
  };

  const handleProblemSolved = () => {
    // Close the sheet as the problem is solved
    resetForm()
    onOpenChange(false)
  }

  const handleContactExpert = () => {
    // Find relevant experts based on category
    const categoryExperts = getExpertsByCategory(category)
    
    // Add some default experts if category doesn't have enough
    let expertsToShow = [...categoryExperts]
    
    if (expertsToShow.length < 3) {
      // Add other experts to show at least 3 options
      const defaultExperts = getExpertsByCategory("Reparaturen")
        .filter(expert => !expertsToShow.some(e => e.id === expert.id))
      
      // Add default experts to fill up to at least 3 options
      expertsToShow = [...expertsToShow, ...defaultExperts.slice(0, 3 - expertsToShow.length)]
    }
    
    // Set the experts and go to expert selection step
    setAvailableExperts(expertsToShow)
    setStep(4) // New step for expert selection
  }

  const handleSelectExpert = (expert: typeof experts[0]) => {
    // Start chat with selected expert
    startExpertChat(expert)
    
    // Reset form and close sheet
    resetForm()
    onOpenChange(false)
    
    // Navigate to chat page
    // Use small timeout to ensure thread is created before navigation
    setTimeout(() => {
      router.push("/chat")
    }, 50)
  }

  const handleBackToAiResponse = () => {
    setStep(2) // Go back to AI response step
  }

  const handleContinueToPost = () => {
    // Proceed to post creation
    setStep(3)
  }

  // Step 1: Problem Description
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          placeholder="Wobei benötigen Sie Hilfe?"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategorie</Label>
        <Select 
          value={category}
          onValueChange={setCategory}
        >
          <SelectTrigger>
            <SelectValue placeholder="Kategorie auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sanitär">Sanitär</SelectItem>
            <SelectItem value="Elektrik">Elektrik</SelectItem>
            <SelectItem value="Innenausbau">Innenausbau</SelectItem>
            <SelectItem value="Außenbereich">Außenbereich</SelectItem>
            <SelectItem value="Zimmerei">Zimmerei</SelectItem>
            <SelectItem value="Malerei">Malerei</SelectItem>
            <SelectItem value="Heizung/Klima">Heizung/Klima</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="urgency">Dringlichkeit</Label>
        <Select
          value={urgency}
          onValueChange={setUrgency}
        >
          <SelectTrigger>
            <SelectValue placeholder="Dringlichkeit auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Niedrig">Niedrig</SelectItem>
            <SelectItem value="Mittel">Mittel</SelectItem>
            <SelectItem value="Hoch">Hoch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Beschreiben Sie Ihr Problem</Label>
        <Textarea
          id="content"
          placeholder="Beschreiben Sie Ihr Problem detailliert..."
          className="min-h-[100px]"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Fotos (Optional)</Label>
        <div className="grid grid-cols-3 gap-2">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={image ?? "/placeholder.svg"}
                alt={`Vorschau ${index + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="aspect-square"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <Camera className="h-4 w-4" />
            <span className="sr-only">Bild hochladen</span>
          </Button>
        </div>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <Button 
        type="button" 
        className="w-full" 
        disabled={isLoadingAIResponse || !title || !content}
        onClick={handleAskAI}
      >
        {isLoadingAIResponse ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird analysiert...
          </>
        ) : (
          <>
            Weiter <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );

  // Step 2: AI Response and User Decision
  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KI-Vorschlag</CardTitle>
          <CardDescription>
            Hier ist ein möglicher Lösungsvorschlag für Ihr Problem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight, rehypeSanitize]}
              remarkPlugins={[remarkGfm]}
            >
              {aiResponse}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Button onClick={handleProblemSolved} variant="outline" className="flex items-center justify-center">
          <CheckCircle className="mr-2 h-4 w-4" />
          Problem gelöst!
        </Button>
        
        <Button onClick={handleContactExpert} variant="outline" className="flex items-center justify-center">
          <MessageSquareHeart className="mr-2 h-4 w-4" />
          Experten kontaktieren
        </Button>
        
        <Button onClick={handleContinueToPost} className="flex items-center justify-center">
          <CircleHelp className="mr-2 h-4 w-4" />
          Frage an Community stellen
        </Button>
      </div>
    </div>
  );

  // Step 3: Final Post Details
  const renderStep3 = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          placeholder="Wobei benötigen Sie Hilfe?"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Weitere Details hinzufügen</Label>
        <Textarea
          id="content"
          placeholder="Fügen Sie zusätzliche Informationen hinzu, die helfen könnten..."
          className="min-h-[100px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>KI-Vorschlag (wird im Beitrag enthalten sein)</Label>
        <div className="rounded-md border p-4 max-h-[150px] overflow-y-auto">
          <div className="prose prose-sm">
            <ReactMarkdown>
              {aiResponse}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || !title}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird gepostet...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            In Community veröffentlichen
          </>
        )}
      </Button>
    </form>
  );

  // Step 4: Expert Selection
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={handleBackToAiResponse} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Zurück</span>
        </Button>
        <h3 className="text-lg font-medium">Experten für {category}</h3>
      </div>

      <div className="space-y-4">
        {availableExperts.length > 0 ? (
          availableExperts.map((expert) => (
            <div key={expert.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={expert.profileImage} alt={expert.name} />
                  <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="font-semibold">{expert.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {expert.specialty}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{expert.rating}</span>
                  <span className="text-muted-foreground text-sm">
                    ({expert.ratingCount})
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {expert.categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="text-muted-foreground h-3.5 w-3.5" />
                  <span>{expert.hourlyRate}€/h</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="text-muted-foreground h-3.5 w-3.5" />
                  <span>{expert.availability}</span>
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={() => handleSelectExpert(expert)}
              >
                <MessageSquareHeart className="mr-2 h-4 w-4" />
                Kontaktieren
              </Button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Leider sind keine Experten für diese Kategorie verfügbar.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90%] sm:h-[90%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {step === 1 && "Problem beschreiben"}
            {step === 2 && "Lösungsvorschlag"}
            {step === 3 && "In Community veröffentlichen"}
            {step === 4 && "Experten auswählen"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </SheetContent>
    </Sheet>
  )
}


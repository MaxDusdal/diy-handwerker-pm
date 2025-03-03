"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface CreatePostSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreatePostSheet({ open, onOpenChange }: CreatePostSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postType, setPostType] = useState<"help" | "showcase">("help")
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    onOpenChange(false)
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90%] sm:h-[90%]">
        <SheetHeader>
          <SheetTitle>Create Post</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Badge
                variant={postType === "help" ? "default" : "outline"}
                className="cursor-pointer flex-1 justify-center py-2"
                onClick={() => setPostType("help")}
              >
                Need Help
              </Badge>
              <Badge
                variant={postType === "showcase" ? "default" : "outline"}
                className="cursor-pointer flex-1 justify-center py-2"
                onClick={() => setPostType("showcase")}
              >
                Project Showcase
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={postType === "help" ? "What do you need help with?" : "Share your project title"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="interior">Interior</SelectItem>
                <SelectItem value="outdoor">Outdoor</SelectItem>
                <SelectItem value="carpentry">Carpentry</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {postType === "help" && (
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Description</Label>
            <Textarea
              id="content"
              placeholder={
                postType === "help" ? "Describe your problem in detail..." : "Share details about your project..."
              }
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Photos</Label>
            <div className="grid grid-cols-3 gap-2">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Upload preview ${index + 1}`}
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
                <span className="sr-only">Upload image</span>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}


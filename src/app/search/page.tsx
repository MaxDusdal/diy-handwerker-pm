"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Sample data for the instruction pages
const anleitungen = [
  {
    id: 1,
    title: "Wasserhahn reparieren",
    description: "Schritt-für-Schritt Anleitung zum Reparieren eines tropfenden Wasserhahns",
    difficulty: "Einfach",
    tools: ["Schraubenzieher", "Zange", "Dichtung"],
    category: "Badezimmer",
    imageUrl: "/images/wasserhahn.jpg"
  },
  {
    id: 2,
    title: "Wand streichen wie ein Profi",
    description: "Lernen Sie, wie Sie Ihre Wände gleichmäßig und ohne Streifen streichen können",
    difficulty: "Mittel",
    tools: ["Farbrolle", "Pinsel", "Abdeckplane", "Malerkrepp"],
    category: "Dekoration",
    imageUrl: "/images/wand-streichen.jpg"
  },
  {
    id: 3,
    title: "Verstopften Abfluss reinigen",
    description: "Einfache Methoden, um einen verstopften Abfluss ohne Chemikalien zu reinigen",
    difficulty: "Einfach",
    tools: ["Saugglocke", "Drahtbürste", "Eimer"],
    category: "Badezimmer",
    imageUrl: "/images/abfluss.jpg"
  },
  {
    id: 4,
    title: "Laminatboden verlegen",
    description: "Ausführliche Anleitung zum Verlegen eines Laminatbodens in Eigenregie",
    difficulty: "Fortgeschritten",
    tools: ["Säge", "Hammer", "Abstandshalter", "Maßband"],
    category: "Bodenbeläge",
    imageUrl: "/images/laminat.jpg"
  },
  {
    id: 5,
    title: "Heimwerker Grundwissen: Bohren",
    description: "Alles was Sie über das Bohren in verschiedene Materialien wissen müssen",
    difficulty: "Einfach",
    tools: ["Bohrmaschine", "Bohrer", "Dübel"],
    category: "Grundlagen",
    imageUrl: "/images/bohren.jpg"
  }
]

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Simple filter function for the search
  const filteredAnleitungen = anleitungen.filter(anleitung => 
    anleitung.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    anleitung.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anleitung.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">DIY Anleitungen durchsuchen</h1>
      
      {/* Search bar */}
      <div className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="Suche nach Anleitungen, Kategorien oder Werkzeugen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Suchen</Button>
      </div>

      {/* Results count */}
      <p className="mb-4 text-gray-600">
        {filteredAnleitungen.length} Anleitungen gefunden
      </p>

      {/* Instruction list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnleitungen.map((anleitung) => (
          <Link href={`/anleitungen/${anleitung.id}`} key={anleitung.id}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <div 
                  className="w-full h-full bg-gray-200"
                  style={{
                    backgroundImage: `url('${anleitung.imageUrl}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                ></div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{anleitung.title}</CardTitle>
                  <Badge variant={
                    anleitung.difficulty === "Einfach" ? "default" :
                    anleitung.difficulty === "Mittel" ? "outline" : 
                    "secondary"
                  }>
                    {anleitung.difficulty}
                  </Badge>
                </div>
                <CardDescription>{anleitung.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{anleitung.category}</Badge>
                  {anleitung.tools.slice(0, 2).map((tool, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {tool}
                    </Badge>
                  ))}
                  {anleitung.tools.length > 2 && (
                    <Badge variant="outline" className="bg-blue-50">
                      +{anleitung.tools.length - 2}
                    </Badge>
                  )}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 
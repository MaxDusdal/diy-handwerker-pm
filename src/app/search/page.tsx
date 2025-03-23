"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

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
  
  const filteredAnleitungen = anleitungen.filter(anleitung => 
    anleitung.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    anleitung.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anleitung.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="relative">
        <div className="h-[250px] w-full bg-gradient-to-b from-primary/10 via-primary/5 to-background"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center px-4">
          <div className="w-full max-w-3xl text-center space-y-6">
            <h1 className="text-3xl sm:text-4xl font-bold">Anleitungen durchsuchen</h1>
            
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Suche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-full border-muted-foreground/20 shadow-md"
              />
              <Button 
                type="submit" 
                className="absolute right-1 top-1 rounded-full h-10"
              >
                Suchen
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 z-10">
        <div className="bg-card rounded-full px-4 py-2 inline-flex items-center mb-6 shadow-sm border">
          <span className="text-sm font-medium">
            {filteredAnleitungen.length} Anleitungen gefunden
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {filteredAnleitungen.map((anleitung) => (
            <Link href={`/anleitungen/${anleitung.id}`} key={anleitung.id} className="block h-full">
              <Card className="h-full overflow-hidden rounded-xl border-border/40 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="aspect-video relative overflow-hidden">
                  <div 
                    className="w-full h-full bg-gray-200 transition-transform hover:scale-105 duration-300"
                    style={{
                      backgroundImage: `url('${anleitung.imageUrl}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <CardTitle className="text-xl text-white drop-shadow-sm">{anleitung.title}</CardTitle>
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pt-3 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge 
                      variant={
                        anleitung.difficulty === "Einfach" ? "default" :
                        anleitung.difficulty === "Mittel" ? "outline" : 
                        "secondary"
                      }
                      className="mb-2"
                    >
                      {anleitung.difficulty}
                    </Badge>
                    <Badge variant="outline">{anleitung.category}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{anleitung.description}</CardDescription>
                </CardHeader>
                
                <CardFooter className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {anleitung.tools.slice(0, 2).map((tool, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 dark:bg-blue-950/30">
                        {tool}
                      </Badge>
                    ))}
                    {anleitung.tools.length > 2 && (
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">
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
    </div>
  )
} 
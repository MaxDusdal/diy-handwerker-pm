"use client";

import { useExperts, SPECIALTIES } from "@/lib/experts-context";
import { Search, Filter, Star, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExpertPage() {
  const { 
    experts,
    filteredExperts,
    setSearchQuery,
    setSelectedSpecialty,
    startExpertChat
  } = useExperts();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialtyLocal, setSelectedSpecialtyLocal] = useState<string | null>(null);
  const router = useRouter();

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchQuery(value);
  };

  // Handle specialty selection
  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialtyLocal(value);
    setSelectedSpecialty(value === "Alle" ? null : value);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSpecialtyLocal(null);
    setSearchQuery("");
    setSelectedSpecialty(null);
  };

  // Contact expert and navigate to chat
  const handleContactExpert = (expert: typeof experts[0]) => {
    // First create or activate the expert chat thread
    startExpertChat(expert);
    
    // Set a small timeout to ensure the thread is created and active before navigating
    setTimeout(() => {
      router.push("/chat");
    }, 50);
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Experten finden</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Suche nach Experten, Fähigkeiten..."
            className="pl-9"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Experten filtern</SheetTitle>
            </SheetHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="specialty">Fachgebiet</Label>
                <Select
                  value={selectedSpecialtyLocal ?? ""}
                  onValueChange={handleSpecialtyChange}
                >
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Fachgebiet auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alle">Alle</SelectItem>
                    {SPECIALTIES.map((specialty: string) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Verfügbarkeit</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    Heute
                  </Badge>
                  <Badge
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    Morgen
                  </Badge>
                  <Badge
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    Diese Woche
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetFilters}
              >
                Zurücksetzen
              </Button>
              <Button className="flex-1">Filter anwenden</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto py-2">
        <Badge
          key="all"
          variant={!selectedSpecialtyLocal ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap"
          onClick={() => handleSpecialtyChange("Alle")}
        >
          Alle
        </Badge>
        {SPECIALTIES.map((specialty: string) => (
          <Badge
            key={specialty}
            variant={selectedSpecialtyLocal === specialty ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => handleSpecialtyChange(specialty)}
          >
            {specialty}
          </Badge>
        ))}
      </div>

      <div className="space-y-4">
        {filteredExperts.length > 0 ? (
          filteredExperts.map((expert) => (
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
                {expert.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
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
                onClick={() => handleContactExpert(expert)}
              >
                Experten kontaktieren
              </Button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Keine Experten gefunden, die Ihren Kriterien entsprechen.
            </p>
            <p className="text-sm">
              Versuchen Sie, Ihre Filter oder Suchbegriffe anzupassen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

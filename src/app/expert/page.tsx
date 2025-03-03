"use client";

import { useState } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for experts
const experts = [
  {
    id: 1,
    name: "Alex Johnson",
    specialty: "Plumbing",
    rating: 4.8,
    reviews: 127,
    distance: "2.3 miles",
    availability: "Available today",
    skills: ["Pipe Repair", "Fixture Installation", "Water Heaters"],
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "Sam Rodriguez",
    specialty: "Electrical",
    rating: 4.9,
    reviews: 94,
    distance: "3.7 miles",
    availability: "Available tomorrow",
    skills: ["Wiring", "Lighting", "Panel Upgrades"],
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    name: "Jamie Smith",
    specialty: "Carpentry",
    rating: 4.7,
    reviews: 56,
    distance: "1.5 miles",
    availability: "Available today",
    skills: ["Furniture Assembly", "Cabinets", "Flooring"],
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 4,
    name: "Taylor Wilson",
    specialty: "Painting",
    rating: 4.6,
    reviews: 42,
    distance: "4.2 miles",
    availability: "Available in 2 days",
    skills: ["Interior", "Exterior", "Staining"],
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 5,
    name: "Morgan Lee",
    specialty: "General Handyman",
    rating: 4.9,
    reviews: 138,
    distance: "0.8 miles",
    availability: "Available today",
    skills: ["Repairs", "Installation", "Maintenance"],
    image: "/placeholder.svg?height=80&width=80",
  },
];

// Specialty options
const specialties = [
  "All",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "General Handyman",
  "HVAC",
  "Roofing",
  "Landscaping",
];

export default function ExpertPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [maxDistance, setMaxDistance] = useState(10);

  // Filter experts based on search and filters
  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesSpecialty =
      selectedSpecialty === "All" || expert.specialty === selectedSpecialty;

    // Parse distance (removing "miles" and converting to number)
    const expertDistance = Number.parseFloat(expert.distance.split(" ")[0]);
    const matchesDistance = expertDistance <= maxDistance;

    return matchesSearch && matchesSpecialty && matchesDistance;
  });

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Find an Expert</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search for experts, skills..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              <SheetTitle>Filter Experts</SheetTitle>
            </SheetHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={selectedSpecialty}
                  onValueChange={setSelectedSpecialty}
                >
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="distance">Maximum Distance</Label>
                  <span className="text-muted-foreground text-sm">
                    {maxDistance} miles
                  </span>
                </div>
                <Slider
                  id="distance"
                  min={1}
                  max={20}
                  step={1}
                  value={[maxDistance]}
                  onValueChange={(value) => setMaxDistance(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    Today
                  </Badge>
                  <Badge
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    Tomorrow
                  </Badge>
                  <Badge
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    This Week
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialty("All");
                  setMaxDistance(10);
                }}
              >
                Reset
              </Button>
              <Button className="flex-1">Apply Filters</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto py-2">
        {specialties.map((specialty) => (
          <Badge
            key={specialty}
            variant={selectedSpecialty === specialty ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedSpecialty(specialty)}
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
                  <AvatarImage src={expert.image} alt={expert.name} />
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
                    ({expert.reviews})
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {expert.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="text-muted-foreground h-3.5 w-3.5" />
                  <span>{expert.distance}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="text-muted-foreground h-3.5 w-3.5" />
                  <span>{expert.availability}</span>
                </div>
              </div>

              <Button className="w-full">Contact Expert</Button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No experts found matching your criteria.
            </p>
            <p className="text-sm">
              Try adjusting your filters or search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

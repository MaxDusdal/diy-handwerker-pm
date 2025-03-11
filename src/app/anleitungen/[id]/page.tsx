"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Sample data for the instruction pages
const anleitungen = [
  {
    id: "1",
    title: "Wasserhahn reparieren",
    description:
      "Schritt-für-Schritt Anleitung zum Reparieren eines tropfenden Wasserhahns",
    difficulty: "Einfach",
    duration: "30 Minuten",
    tools: ["Schraubenzieher", "Zange", "Dichtung"],
    materials: ["Neue Dichtung", "Eventuell neue Kartusche"],
    category: "Badezimmer",
    imageUrl: "/images/wasserhahn.jpg",
    steps: [
      {
        title: "Wasserversorgung abstellen",
        description:
          "Stellen Sie sicher, dass die Wasserversorgung zu dem betroffenen Wasserhahn abgestellt ist. Dies erfolgt üblicherweise durch Absperrventile unter dem Waschbecken.",
        imageUrl: "/images/wasserhahn-step1.jpg",
        videoUrl: "/videos/wasserhahn-step1.mp4",
      },
      {
        title: "Wasserhahn zerlegen",
        description:
          "Entfernen Sie die Abdeckkappe des Wasserhahns, lösen Sie die darunter liegende Schraube und nehmen Sie den Griff ab.",
        imageUrl: "/images/wasserhahn-step2.jpg",
        videoUrl: "/videos/wasserhahn-step2.mp4",
      },
      {
        title: "Kartusche ausbauen",
        description:
          "Lösen Sie die Überwurfmutter und entnehmen Sie die Kartusche vorsichtig. Achten Sie auf die Position für den Wiedereinbau.",
        imageUrl: "/images/wasserhahn-step3.jpg",
        videoUrl: "/videos/wasserhahn-step3.mp4",
      },
      {
        title: "Dichtungen überprüfen und ersetzen",
        description:
          "Prüfen Sie die Dichtungen auf Verschleiß und Kalkablagerungen. Ersetzen Sie beschädigte Dichtungen durch neue.",
        imageUrl: "/images/wasserhahn-step4.jpg",
        videoUrl: "/videos/wasserhahn-step4.mp4",
      },
      {
        title: "Zusammenbau",
        description:
          "Bauen Sie den Wasserhahn in umgekehrter Reihenfolge wieder zusammen. Achten Sie auf korrekten Sitz aller Komponenten.",
        imageUrl: "/images/wasserhahn-step5.jpg",
        videoUrl: "/videos/wasserhahn-step5.mp4",
      },
    ],
    tips: [
      "Legen Sie sich alle Werkzeuge vor Beginn der Arbeit bereit",
      "Machen Sie Fotos während des Ausbaus, um die korrekte Reihenfolge beim Zusammenbau zu gewährleisten",
      "Reinigen Sie alle Teile gründlich von Kalk, bevor Sie sie wieder einbauen",
    ],
  },
  {
    id: "2",
    title: "Wand streichen wie ein Profi",
    description:
      "Lernen Sie, wie Sie Ihre Wände gleichmäßig und ohne Streifen streichen können",
    difficulty: "Mittel",
    duration: "1-2 Tage",
    tools: [
      "Farbrolle",
      "Pinsel",
      "Abdeckplane",
      "Malerkrepp",
      "Teleskopstange",
      "Farbwanne",
    ],
    materials: ["Wandfarbe", "Grundierung (falls nötig)"],
    category: "Dekoration",
    imageUrl: "/images/wand-streichen.jpg",
    steps: [
      {
        title: "Raum vorbereiten",
        description:
          "Entfernen Sie Möbel oder stellen Sie sie in die Mitte des Raumes und decken Sie sie mit Folie ab. Verlegen Sie eine Abdeckplane auf dem Boden.",
        imageUrl: "/images/wand-step1.jpg",
        videoUrl: "/videos/wand-step1.mp4",
      },
      {
        title: "Wände reinigen",
        description:
          "Reinigen Sie die Wände von Staub und Schmutz. Entfernen Sie Nägel und füllen Sie Löcher mit Spachtelmasse aus.",
        imageUrl: "/images/wand-step2.jpg",
        videoUrl: "/videos/wand-step2.mp4",
      },
      {
        title: "Abkleben",
        description:
          "Kleben Sie Fenster, Türrahmen und Sockelleisten mit Malerkrepp ab, um saubere Kanten zu erhalten.",
        imageUrl: "/images/wand-step3.jpg",
        videoUrl: "/videos/wand-step3.mp4",
      },
      {
        title: "Streichen der Ecken und Kanten",
        description:
          "Streichen Sie zuerst die Ecken und Kanten mit einem Pinsel, etwa 5 cm breit von den Rändern.",
        imageUrl: "/images/wand-step4.jpg",
        videoUrl: "/videos/wand-step4.mp4",
      },
      {
        title: "Hauptfläche streichen",
        description:
          "Streichen Sie die Hauptfläche mit einer Farbrolle in W-Form, um die Farbe zu verteilen, und glätten Sie anschließend mit langen, geraden Zügen von oben nach unten.",
        imageUrl: "/images/wand-step5.jpg",
        videoUrl: "/videos/wand-step5.mp4",
      },
      {
        title: "Zweiter Anstrich",
        description:
          "Lassen Sie die erste Schicht vollständig trocknen (gemäß Herstellerangaben) und tragen Sie dann einen zweiten Anstrich auf.",
        imageUrl: "/images/wand-step6.jpg",
        videoUrl: "/videos/wand-step6.mp4",
      },
    ],
    tips: [
      "Streichen Sie immer vom Trockenen ins Feuchte",
      "Verwenden Sie hochwertiges Malerwerkzeug für bessere Ergebnisse",
      "Warten Sie zwischen den Anstrichen die vollständige Trocknungszeit ab",
      "Arbeiten Sie bei guter Beleuchtung, um Fehlstellen rechtzeitig zu erkennen",
    ],
  },
  {
    id: "3",
    title: "Verstopften Abfluss reinigen",
    description:
      "Einfache Methoden, um einen verstopften Abfluss ohne Chemikalien zu reinigen",
    difficulty: "Einfach",
    duration: "15-30 Minuten",
    tools: ["Saugglocke", "Drahtbürste", "Eimer", "Handschuhe"],
    materials: ["Backpulver", "Essig", "Heißes Wasser"],
    category: "Badezimmer",
    imageUrl: "/images/abfluss.jpg",
    steps: [
      {
        title: "Wasser ablassen",
        description:
          "Falls das Becken oder die Wanne mit Wasser gefüllt ist, lassen Sie so viel wie möglich ab und fangen Sie überschüssiges Wasser in einem Eimer auf.",
        imageUrl: "/images/abfluss-step1.jpg",
        videoUrl: "/videos/abfluss-step1.mp4",
      },
      {
        title: "Saugglocke anwenden",
        description:
          "Platzieren Sie die Saugglocke über dem Abfluss und stellen Sie sicher, dass sie vollständig abgedichtet ist. Drücken Sie mehrmals kräftig nach unten und ziehen Sie dann ruckartig nach oben.",
        imageUrl: "/images/abfluss-step2.jpg",
        videoUrl: "/videos/abfluss-step2.mp4",
      },
      {
        title: "Natürliches Reinigungsmittel anwenden",
        description:
          "Geben Sie eine halbe Tasse Backpulver in den Abfluss, gefolgt von einer halben Tasse Essig. Der entstehende Schaum hilft, Verstopfungen zu lösen. Warten Sie 15-30 Minuten.",
        imageUrl: "/images/abfluss-step3.jpg",
        videoUrl: "/videos/abfluss-step3.mp4",
      },
      {
        title: "Mit heißem Wasser nachspülen",
        description:
          "Gießen Sie einen Topf kochendes Wasser langsam in den Abfluss, um gelöste Verstopfungen wegzuspülen.",
        imageUrl: "/images/abfluss-step4.jpg",
        videoUrl: "/videos/abfluss-step4.mp4",
      },
      {
        title: "Abflusssieb reinigen",
        description:
          "Entfernen Sie das Abflusssieb und reinigen Sie es gründlich von Haaren und anderen Rückständen mit einer Drahtbürste.",
        imageUrl: "/images/abfluss-step5.jpg",
        videoUrl: "/videos/abfluss-step5.mp4",
      },
    ],
    tips: [
      "Vermeiden Sie chemische Abflussreiniger, da diese Rohre beschädigen können",
      "Führen Sie regelmäßige Reinigungen durch, um Verstopfungen vorzubeugen",
      "Verwenden Sie ein Abflusssieb, um zu verhindern, dass Haare und Schmutz in den Abfluss gelangen",
      "Spülen Sie wöchentlich mit heißem Wasser und etwas Spülmittel, um Fettablagerungen zu vermeiden",
    ],
  },
  {
    id: "4",
    title: "Laminatboden verlegen",
    description:
      "Ausführliche Anleitung zum Verlegen eines Laminatbodens in Eigenregie",
    difficulty: "Fortgeschritten",
    duration: "1-2 Tage",
    tools: [
      "Säge",
      "Hammer",
      "Abstandshalter",
      "Maßband",
      "Schlagklotz",
      "Zugeisen",
      "Gehrungslade",
    ],
    materials: [
      "Laminatboden",
      "Dämmunterlage",
      "Sockelleisten",
      "Übergangsschienen",
    ],
    category: "Bodenbeläge",
    imageUrl: "/images/laminat.jpg",
    steps: [
      {
        title: "Vorbereitung des Untergrunds",
        description:
          "Der Untergrund muss sauber, trocken und eben sein. Entfernen Sie alten Bodenbelag und reinigen Sie den Boden gründlich. Prüfen Sie die Ebenheit mit einer Wasserwaage.",
        imageUrl: "/images/laminat-step1.jpg",
        videoUrl: "/videos/laminat-step1.mp4",
      },
      {
        title: "Dämmunterlage verlegen",
        description:
          "Verlegen Sie die Dämmunterlage auf dem vorbereiteten Untergrund. Die Bahnen sollten Stoß an Stoß liegen und mit Klebeband verbunden werden, um ein Verrutschen zu verhindern.",
        imageUrl: "/images/laminat-step2.jpg",
        videoUrl: "/videos/laminat-step2.mp4",
      },
      {
        title: "Erste Reihe verlegen",
        description:
          "Beginnen Sie in einer Ecke des Raumes und arbeiten Sie von links nach rechts. Die Federseite sollte zur Wand zeigen. Halten Sie mit Abstandshaltern einen Abstand von ca. 10 mm zur Wand ein.",
        imageUrl: "/images/laminat-step3.jpg",
        videoUrl: "/videos/laminat-step3.mp4",
      },
      {
        title: "Weitere Reihen verlegen",
        description:
          "Setzen Sie die nächsten Reihen im Verband (mit versetzten Fugen) fort. Stecken Sie die Dielen schräg ein und klappen Sie sie nach unten. Verwenden Sie bei Bedarf einen Schlagklotz und Hammer, um die Verbindungen fest zu schließen.",
        imageUrl: "/images/laminat-step4.jpg",
        videoUrl: "/videos/laminat-step4.mp4",
      },
      {
        title: "Zuschneiden der Laminatdielen",
        description:
          "Messen Sie den benötigten Zuschnitt genau aus und markieren Sie die Schnittlinie. Sägen Sie die Diele mit der Dekorseite nach oben, wenn Sie eine Stichsäge verwenden, oder mit der Dekorseite nach unten bei einer Handsäge.",
        imageUrl: "/images/laminat-step5.jpg",
        videoUrl: "/videos/laminat-step5.mp4",
      },
      {
        title: "Letzte Reihe anpassen",
        description:
          "Die letzte Reihe muss meist in der Breite angepasst werden. Messen Sie den Abstand zur Wand und übertragen Sie das Maß auf die Dielen. Nutzen Sie ein Zugeisen, um die letzte Reihe einzusetzen.",
        imageUrl: "/images/laminat-step6.jpg",
        videoUrl: "/videos/laminat-step6.mp4",
      },
      {
        title: "Sockelleisten anbringen",
        description:
          "Montieren Sie zum Abschluss die Sockelleisten, um den Dehnungsrand zu verdecken. Die Leisten können mit Nägeln, Schrauben oder speziellem Kleber befestigt werden.",
        imageUrl: "/images/laminat-step7.jpg",
        videoUrl: "/videos/laminat-step7.mp4",
      },
    ],
    tips: [
      "Akklimatisieren Sie den Laminatboden mindestens 48 Stunden in dem Raum, in dem er verlegt werden soll",
      "Mischen Sie Dielen aus verschiedenen Paketen, um ein gleichmäßiges Erscheinungsbild zu erzielen",
      "Arbeiten Sie beim Zuschneiden mit einer Feinsäge, um Ausrisse zu vermeiden",
      "Beim Verlegen in mehreren Räumen sollten Sie Übergangsschienen an den Türschwellen anbringen",
      "Stellen Sie sicher, dass der Boden nach dem Verlegen mindestens 24 Stunden nicht stark belastet wird",
    ],
  },
  {
    id: "5",
    title: "Heimwerker Grundwissen: Bohren",
    description:
      "Alles was Sie über das Bohren in verschiedene Materialien wissen müssen",
    difficulty: "Einfach",
    duration: "variabel",
    tools: [
      "Bohrmaschine",
      "Verschiedene Bohrer",
      "Wasserwaage",
      "Bleistift",
      "Maßband",
      "Schutzbrille",
    ],
    materials: ["Dübel", "Schrauben"],
    category: "Grundlagen",
    imageUrl: "/images/bohren.jpg",
    steps: [
      {
        title: "Die richtige Bohrmaschine auswählen",
        description:
          "Für leichte Arbeiten in Holz oder Gipskarton reicht ein Akkubohrschrauber. Für Mauerwerk und Beton benötigen Sie eine Schlagbohrmaschine oder einen Bohrhammer.",
        imageUrl: "/images/bohren-step1.jpg",
        videoUrl: "/videos/bohren-step1.mp4",
      },
      {
        title: "Richtigen Bohrer auswählen",
        description:
          "Wählen Sie den passenden Bohrer für Ihr Material: Holzbohrer für Holz, Metallbohrer für Metall, Steinbohrer für Mauerwerk. Achten Sie auf den richtigen Durchmesser, passend zu Ihren Dübeln.",
        imageUrl: "/images/bohren-step2.jpg",
        videoUrl: "/videos/bohren-step2.mp4",
      },
      {
        title: "Bohrstelle markieren und vorbereiten",
        description:
          "Markieren Sie die Bohrstelle präzise mit einem Bleistift. Bei glatten Oberflächen kann ein Kreuz oder ein kleiner Einschlag mit Hammer und Nagel helfen, damit der Bohrer nicht verrutscht.",
        imageUrl: "/images/bohren-step3.jpg",
        videoUrl: "/videos/bohren-step3.mp4",
      },
      {
        title: "Richtige Bohrtechnik",
        description:
          "Halten Sie die Bohrmaschine im rechten Winkel zur Oberfläche. Beginnen Sie langsam und erhöhen Sie dann die Geschwindigkeit. Bei Mauerwerk schalten Sie die Schlagfunktion erst ein, wenn der Bohrer sicher geführt wird.",
        imageUrl: "/images/bohren-step4.jpg",
        videoUrl: "/videos/bohren-step4.mp4",
      },
      {
        title: "In Holz bohren",
        description:
          "Verwenden Sie Holzbohrer mit Zentrierspitze. Bohren Sie zunächst mit niedriger Drehzahl, bis die Spitze eingedrungen ist. Um Ausrisse auf der Rückseite zu vermeiden, legen Sie ein Stück Restholz unter.",
        imageUrl: "/images/bohren-step5.jpg",
        videoUrl: "/videos/bohren-step5.mp4",
      },
      {
        title: "In Mauerwerk bohren",
        description:
          "Verwenden Sie einen Steinbohrer und die Schlagfunktion Ihrer Bohrmaschine. Bohren Sie zunächst ohne Schlag an, bis der Bohrer Führung hat. Drücken Sie nicht zu stark - lassen Sie die Maschine die Arbeit machen.",
        imageUrl: "/images/bohren-step6.jpg",
        videoUrl: "/videos/bohren-step6.mp4",
      },
      {
        title: "Dübel setzen",
        description:
          "Entfernen Sie Bohrstaub aus dem Loch. Setzen Sie den passenden Dübel ein, bis er bündig mit der Wand abschließt. Der Dübel sollte fest sitzen, aber nicht verkantet sein.",
        imageUrl: "/images/bohren-step7.jpg",
        videoUrl: "/videos/bohren-step7.mp4",
      },
    ],
    tips: [
      "Tragen Sie immer eine Schutzbrille beim Bohren",
      "Verwenden Sie einen Leitungsdetektor, um verdeckte Strom-, Wasser- oder Gasleitungen zu finden, bevor Sie bohren",
      "Bohren Sie bei Fliesen in die Fugen, wenn möglich",
      "Bei größeren Bohrlöchern arbeiten Sie sich mit einem kleineren Bohrer vor und wechseln dann zum gewünschten Durchmesser",
      "Halten Sie die Bohrmaschine während des Bohrens immer gerade, um das Verkanten des Bohrers zu vermeiden",
    ],
  },
  // More instructions would be defined here
];

export default function AnleitungDetailPage() {
  const params = useParams();
  const { id } = params;

  // Find the instruction by ID
  const anleitung = anleitungen.find((a) => a.id === id);

  // Fallback if instruction is not found
  if (!anleitung) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="mb-6 text-3xl font-bold">Anleitung nicht gefunden</h1>
        <p className="mb-4">
          Die gesuchte Anleitung konnte nicht gefunden werden.
        </p>
        <Button asChild>
          <Link href="/search">Zurück zur Suche</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/search">← Zurück zur Suche</Link>
        </Button>
      </div>

      {/* Header section */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="mb-2 text-3xl font-bold">{anleitung.title}</h1>
          <p className="mb-4 text-gray-600">{anleitung.description}</p>

          <div className="mb-4 flex flex-wrap gap-2">
            <Badge
              variant={
                anleitung.difficulty === "Einfach"
                  ? "default"
                  : anleitung.difficulty === "Mittel"
                    ? "outline"
                    : "secondary"
              }
            >
              {anleitung.difficulty}
            </Badge>
            <Badge variant="outline">{anleitung.category}</Badge>
            <Badge variant="outline" className="bg-blue-50">
              Dauer: {anleitung.duration}
            </Badge>
          </div>

          <div className="mb-4">
            <h2 className="mb-2 text-xl font-semibold">Benötigte Werkzeuge:</h2>
            <div className="flex flex-wrap gap-2">
              {anleitung.tools.map((tool, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          {anleitung.materials && (
            <div className="mb-4">
              <h2 className="mb-2 text-xl font-semibold">Materialien:</h2>
              <div className="flex flex-wrap gap-2">
                {anleitung.materials.map((material, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative aspect-video overflow-hidden rounded-lg">
          <div
            className="h-full w-full bg-gray-200"
            style={{
              backgroundImage: `url('${anleitung.imageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Steps section - now showing all steps vertically */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">
          Schritt-für-Schritt Anleitung
        </h2>

        <div className="space-y-8">
          {anleitung.steps.map((step, index) => (
            <div key={index} className="overflow-hidden">
              <h3 className="mb-4 text-xl font-semibold">
                Schritt {index + 1}: {step.title}
              </h3>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <p className="mb-4">{step.description}</p>
                </div>

                <div className="aspect-video overflow-hidden rounded-md bg-gray-200">
                  <div
                    className="h-full w-full bg-gray-200"
                    style={{
                      backgroundImage: `url('${step.imageUrl}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                </div>
              </div>


            </div>
          ))}
        </div>
      </div>

      {/* Tips section */}
      {anleitung.tips && anleitung.tips.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Profi-Tipps</h2>
          <ul className="list-disc space-y-2 pl-5">
            {anleitung.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Related instructions placeholder */}
      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Verwandte Anleitungen</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {anleitungen
            .filter((a) => a.id !== id && a.category === anleitung.category)
            .slice(0, 3)
            .map((related) => (
              <Link href={`/anleitungen/${related.id}`} key={related.id}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <div
                      className="h-full w-full bg-gray-200"
                      style={{
                        backgroundImage: `url('${related.imageUrl}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{related.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {related.difficulty} • {related.duration}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

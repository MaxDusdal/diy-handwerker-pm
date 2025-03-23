# DIY-Handwerker-PM

Ein interaktives Mockup für eine DIY-Heimwerker Community-Plattform, entwickelt als Projektarbeit für das Modul Projektmanagement.

## Projektbeschreibung

Diese Plattform bietet Heimwerkern die Möglichkeit, Projekte zu teilen, Hilfe anzufordern und Anleitungen zu finden. Das Mockup demonstriert folgende Kernfunktionen:

- **Social-Media Feed**: Modernes Interface zum Teilen von DIY-Projekten, ähnlich Instagram/TikTok
- **Hilfefunktion**: Nutzer können Fragen stellen und Hilfe bei Projekten erhalten
- **Anleitungssuche**: Durchsuchbare Datenbank mit DIY-Tutorials und Schritt-für-Schritt-Anleitungen
- **KI-Integration**: Automatische Vorschläge und Hilfestellungen durch die Gemini API

## Hinweis

Dies ist ein rough and dirty Mockup, das lediglich zur Demonstration unserer Projektidee dient, die Güte des Codes oder des UI unterliegt keiner Verbesserung und als Randaufgabe ist dementsprechend auch kein hoher Qualitätsstandard zu erwarten. Die Anwendung läuft vollständig lokal und ist nicht für den Produktiveinsatz gedacht.

## Technologie-Stack

Das Projekt basiert auf dem [T3 Stack](https://create.t3.gg/):
- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org/)
- [shadcn/ui](https://ui.shadcn.com/) für Komponenten
- [Gemini API](https://ai.google.dev/) für KI-Funktionalitäten

## Installation und Start

1. Repository klonen
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. Die `.env.example` Datei kopieren zu `.env` und deinen Gemini API Key eintragen
4. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

**Wichtig**: Für die volle Funktionalität ist ein Gemini API Key erforderlich, der in der `.env` Datei nach dem in `.env.example` gezeigten Muster konfiguriert werden muss.

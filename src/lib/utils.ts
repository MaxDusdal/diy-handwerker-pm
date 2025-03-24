import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const intervals = {
    Jahr: 31536000,
    Monat: 2592000, 
    Woche: 604800,
    Tag: 86400,
    Stunde: 3600,
    Minute: 60,
    Sekunde: 1,
  };

  let counter;
  for (const key in intervals) {
    counter = Math.floor(seconds / intervals[key as keyof typeof intervals]);
    if (counter > 0) {
      if (key === "Monat" && counter > 1) {
        return counter + " Monate" + " vorher";
      }
      return counter + " " + key + (counter > 1 ? "n" : "") + " her";
    }
  }
  return "gerade eben";
}

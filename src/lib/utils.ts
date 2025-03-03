import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  let counter;
  for (const key in intervals) {
    counter = Math.floor(seconds / intervals[key as keyof typeof intervals]);
    if (counter > 0) {
      return counter + " " + key + (counter > 1 ? "s" : "") + " ago";
    }
  }
  return "just now";
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nameInitials(name: string) {
  const initials = name.split(" ").map((word) => word[0]);
  return initials.length === 1
    ? initials[0]
    : `${initials[0]}${initials[initials.length - 1]}`;
}

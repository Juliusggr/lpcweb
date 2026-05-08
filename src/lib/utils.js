import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // If it's a local absolute path, prefix with /@fs/ for Vite dev server
  if (path.startsWith('/') || path.match(/^[a-zA-Z]:/)) {
    return `/@fs/${path.replace(/\\/g, '/')}`;
  }
  return path;
}

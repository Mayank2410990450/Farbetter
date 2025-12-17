import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getOptimizedImageUrl(url, width = null) {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('cloudinary.com')) return url;

  // Check if transformations already exist (simple check)
  // Cloudinary URLs: .../upload/v1234... or .../upload/w_500,h_500/v1234...
  // We want to insert/append transformations after /upload/

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  let transformations = ['f_auto', 'q_auto'];
  if (width) {
    transformations.push(`w_${width}`);
    transformations.push('c_limit');
  }

  // Join our new transformations with existing URL structure
  // This is a basic implementation. Ideally we'd parse existing transformations, but assuming standard clean URLs from DB
  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
}

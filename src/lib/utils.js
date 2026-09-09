import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Standard shadcn class-name merger (see components.json aliases). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Vietnamese number format, e.g. `183350` -> `183.350`.
 *
 * The locale is explicit on purpose. `Number.prototype.toLocaleString()` without a locale resolves
 * to the host locale, which differs between the Node renderer and the browser, so the server and
 * client produce different text and React reports a hydration mismatch.
 */
const NUMBER_FORMAT = new Intl.NumberFormat('vi-VN')

/** Formats a score for display with Vietnamese thousands separators. */
export function formatScore(value: number): string {
  return NUMBER_FORMAT.format(value)
}

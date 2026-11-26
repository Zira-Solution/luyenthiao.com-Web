import { z } from '@/lib/zod'

/** Normalizes optional or SQL-nullable strings to a plain string fallback. */
export const optStr = (fallback = '') =>
  z
    .string()
    .nullish()
    .transform((v) => v ?? fallback)

/** Normalizes optional or SQL-nullable numbers to a finite fallback. */
export const optNum = (fallback = 0) =>
  z
    .number()
    .nullish()
    .transform((v) => v ?? fallback)

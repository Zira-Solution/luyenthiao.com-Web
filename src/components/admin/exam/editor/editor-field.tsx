'use client'

import type { ChangeEvent, ReactElement, ReactNode } from 'react'

export interface FieldProps {
  label: string
  children: ReactNode
}

export function Field({ label, children }: FieldProps): ReactElement {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}

export interface TextInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function TextInput({ value, onChange, placeholder }: TextInputProps): ReactElement {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:outline-none"
    />
  )
}

export interface NumberInputProps {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
}

export function NumberInput({ value, onChange, min = 1, max }: NumberInputProps): ReactElement {
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const parsed = Number.parseInt(e.target.value, 10)
        onChange(Number.isNaN(parsed) ? min : parsed)
      }}
      className="focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:outline-none"
    />
  )
}

export interface TextAreaInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}

export function TextAreaInput({
  value,
  onChange,
  placeholder,
  rows = 4,
}: TextAreaInputProps): ReactElement {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      spellCheck={false}
      className="focus:border-brand-primary focus:ring-brand-primary/20 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:outline-none"
    />
  )
}

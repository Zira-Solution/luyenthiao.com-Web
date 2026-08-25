"use client"

import type { ChangeEvent, ReactElement, ReactNode } from "react"

interface FieldProps {
  label: string
  children: ReactNode
}

export function Field({ label, children }: FieldProps): ReactElement {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-white/60 text-[11px] font-black uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}

interface TextInputProps {
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
      className="bg-white/10 text-white font-semibold text-sm rounded-xl px-3 py-2.5 focus:outline-none border border-transparent focus:border-brand-primary placeholder:text-white/30"
    />
  )
}

interface NumberInputProps {
  value: number
  onChange: (n: number) => void
  min?: number
}

export function NumberInput({
  value,
  onChange,
  min = 1,
}: NumberInputProps): ReactElement {
  return (
    <input
      type="number"
      min={min}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        onChange(parseInt(e.target.value, 10) || 1)
      }
      className="bg-white/10 text-white font-semibold text-sm rounded-xl px-3 py-2.5 focus:outline-none border border-transparent focus:border-brand-primary"
    />
  )
}

interface TextAreaInputProps {
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
      className="w-full bg-white/10 text-white font-semibold text-sm rounded-xl px-3 py-2.5 focus:outline-none border border-transparent focus:border-brand-primary placeholder:text-white/30 resize-y"
    />
  )
}
"use client"

import { X } from "lucide-react"
import { useState, type KeyboardEvent, type ReactElement } from "react"

interface TagsInputProps {
  values: string[] | undefined
  onChange: (v: string[] | undefined) => void
  placeholder?: string
}

export function TagsInput({ values, onChange, placeholder }: TagsInputProps): ReactElement {
  const [draft, setDraft] = useState("")

  const commit = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    const next = Array.from(new Set([...(values ?? []), trimmed]))
    onChange(next)
    setDraft("")
  }

  const remove = (tag: string) => {
    const next = (values ?? []).filter((t) => t !== tag)
    onChange(next.length ? next : undefined)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commit(draft)
    } else if (e.key === "Backspace" && !draft && values?.length) {
      remove(values[values.length - 1] as string)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-white/10 rounded-xl px-2 py-1.5 border border-transparent focus-within:border-brand-primary">
      {(values ?? []).map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-lg bg-brand-primary/20 text-white text-xs font-semibold"
        >
          {tag}
          <button
            onClick={() => remove(tag)}
            className="text-white/60 hover:text-white cursor-pointer"
            aria-label={`Xóa ${tag}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={values?.length ? "" : placeholder}
        className="flex-1 min-w-[120px] bg-transparent text-white text-sm py-0.5 focus:outline-none placeholder:text-white/30"
      />
    </div>
  )
}
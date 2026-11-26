'use client'

import { X } from 'lucide-react'
import { useState, type KeyboardEvent, type ReactElement } from 'react'

export interface TagsInputProps {
  values: string[] | undefined
  onChange: (v: string[] | undefined) => void
  placeholder?: string
}

export function TagsInput({ values, onChange, placeholder }: TagsInputProps): ReactElement {
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    const next = Array.from(new Set([...(values ?? []), trimmed]))
    onChange(next)
    setDraft('')
  }

  const remove = (tag: string) => {
    const next = (values ?? []).filter((t) => t !== tag)
    onChange(next.length ? next : undefined)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && !draft && values?.length) {
      remove(values[values.length - 1] as string)
    }
  }

  return (
    <div className="focus-within:border-brand-primary focus-within:ring-brand-primary/20 flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus-within:ring-2">
      {(values ?? []).map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 py-0.5 pr-1 pl-2 text-xs font-medium text-blue-800"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            className="cursor-pointer text-blue-600 hover:text-blue-900"
            aria-label={`Xóa ${tag}`}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={values?.length ? '' : placeholder}
        className="min-w-[120px] flex-1 bg-transparent py-0.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
      />
    </div>
  )
}

import { useState, useRef, useCallback } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { Tag } from "@/types/figure"

interface TagInputProps {
  allTags: Tag[]
  selectedTags: Tag[]
  onChange: (tags: Tag[]) => void
}

export function TagInput({ allTags, selectedTags, onChange }: TagInputProps) {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedIds = new Set(selectedTags.map((t) => t.id))

  const suggestions = query.trim()
    ? allTags.filter(
        (t) =>
          !selectedIds.has(t.id) &&
          t.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : []

  const addTag = useCallback(
    (tag: Tag) => {
      if (!selectedIds.has(tag.id)) {
        onChange([...selectedTags, tag])
      }
      setQuery("")
      setShowSuggestions(false)
      inputRef.current?.focus()
    },
    [selectedTags, selectedIds, onChange],
  )

  const removeTag = useCallback(
    (tagId: string) => {
      onChange(selectedTags.filter((t) => t.id !== tagId))
    },
    [selectedTags, onChange],
  )

  const commitText = useCallback(
    (text: string) => {
      const name = text.trim()
      if (!name) return

      const existing = allTags.find((t) => t.name === name)
      if (existing) {
        addTag(existing)
      } else {
        const alreadySelected = selectedTags.find((t) => t.name === name)
        if (!alreadySelected) {
          onChange([...selectedTags, { id: crypto.randomUUID(), name }])
        }
      }
      setQuery("")
    },
    [allTags, selectedTags, onChange, addTag],
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commitText(query)
    } else if (e.key === "Backspace" && !query && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].id)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (val.includes(",")) {
      const parts = val.split(",")
      for (const part of parts.slice(0, -1)) {
        commitText(part)
      }
      setQuery(parts[parts.length - 1])
    } else {
      setQuery(val)
    }
    setShowSuggestions(true)
  }

  return (
    <div className="space-y-1.5">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => {
            const isNew = !allTags.some((t) => t.id === tag.id)
            return (
              <Badge
                key={tag.id}
                variant="default"
                className={`cursor-pointer select-none gap-0.5 ${isNew ? "border-dashed" : ""}`}
                onClick={() => removeTag(tag.id)}
              >
                {tag.name}
                <X className="size-3" />
              </Badge>
            )
          })}
        </div>
      )}

      {/* Input with suggestions */}
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="输入标签，按 Enter 或逗号添加"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150)
          }}
          className="h-8"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
            {suggestions.slice(0, 8).map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-accent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(tag)}
              >
                <span
                  className={`size-2 shrink-0 rounded-full ${tag.color ?? "bg-gray-400"}`}
                />
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

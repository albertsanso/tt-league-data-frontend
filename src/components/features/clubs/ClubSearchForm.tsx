import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'

export interface ClubSearchFormProps {
  onSearch: (term: string) => void
  disabled?: boolean
}

export function ClubSearchForm({ onSearch, disabled }: ClubSearchFormProps) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <Input
          id="club-search-name"
          label="Club name"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by similar name"
          disabled={disabled}
          autoComplete="off"
        />
      </div>
      <Button type="submit" disabled={disabled}>
        Search
      </Button>
    </form>
  )
}

import { useEffect, useState } from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'

export interface PracticionerSearchFormProps {
  onSearch: (term: string) => void
  disabled?: boolean
  /** Synced from `?q=` on `/practicioners` (deep link from club members). */
  syncedInputValue?: string
}

export function PracticionerSearchForm({
  onSearch,
  disabled,
  syncedInputValue = '',
}: PracticionerSearchFormProps) {
  const [value, setValue] = useState(syncedInputValue)

  useEffect(() => {
    setValue(syncedInputValue)
  }, [syncedInputValue])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <Input
          id="practicioner-search-name"
          label="Full name"
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

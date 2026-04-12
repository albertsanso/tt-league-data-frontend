import { useState, type FormEvent } from 'react'
import type { MatchSearchAll, MatchSearchFilters } from '../../../lib/match-search-filters'
import {
  defaultMatchSearchFilters,
  MATCH_COMPETITION_CATEGORY_OPTIONS,
  MATCH_COMPETITION_SCOPE_OPTIONS,
  MATCH_COMPETITION_SCOPE_TAG_OPTIONS,
  MATCH_COMPETITION_TYPE_OPTIONS,
  MATCH_SEASON_OPTIONS,
  matchSearchAllLabel,
} from '../../../lib/match-search-filters'
import { cn } from '../../../lib/utils'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'

const selectClassName = cn(
  'rounded border border-gray-300 px-3 py-2 text-sm outline-none',
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
)

export interface MatchesSearchFormProps {
  onSearch: (filters: MatchSearchFilters) => void
  onClearFilters?: () => void
  disabled?: boolean
}

interface SelectFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly (string | MatchSearchAll)[]
  disabled?: boolean
}

function SelectField({ id, label, value, onChange, options, disabled }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        className={selectClassName}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {matchSearchAllLabel(o)}
          </option>
        ))}
      </select>
    </div>
  )
}

export function MatchesSearchForm({ onSearch, onClearFilters, disabled }: MatchesSearchFormProps) {
  const [filters, setFilters] = useState<MatchSearchFilters>(() => defaultMatchSearchFilters())

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSearch(filters)
  }

  function handleClear() {
    setFilters(defaultMatchSearchFilters())
    onClearFilters?.()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          id="match-search-season"
          label="Season"
          value={filters.season}
          disabled={disabled}
          options={MATCH_SEASON_OPTIONS}
          onChange={(season) => setFilters((f) => ({ ...f, season }))}
        />
        <SelectField
          id="match-search-scope"
          label="Competition scope"
          value={filters.competitionScope}
          disabled={disabled}
          options={MATCH_COMPETITION_SCOPE_OPTIONS}
          onChange={(competitionScope) => setFilters((f) => ({ ...f, competitionScope }))}
        />
        <SelectField
          id="match-search-scope-tag"
          label="Competition scope tag"
          value={filters.competitionScopeTag}
          disabled={disabled}
          options={MATCH_COMPETITION_SCOPE_TAG_OPTIONS}
          onChange={(competitionScopeTag) => setFilters((f) => ({ ...f, competitionScopeTag }))}
        />
        <SelectField
          id="match-search-type"
          label="Competition type"
          value={filters.competitionType}
          disabled={disabled}
          options={MATCH_COMPETITION_TYPE_OPTIONS}
          onChange={(competitionType) => setFilters((f) => ({ ...f, competitionType }))}
        />
        <SelectField
          id="match-search-category"
          label="Competition category"
          value={filters.competitionCategory}
          disabled={disabled}
          options={MATCH_COMPETITION_CATEGORY_OPTIONS}
          onChange={(competitionCategory) => setFilters((f) => ({ ...f, competitionCategory }))}
        />
        <Input
          id="match-search-day"
          label="Match day number"
          type="text"
          inputMode="numeric"
          value={filters.matchDayNumber}
          disabled={disabled}
          placeholder="Optional"
          autoComplete="off"
          onChange={(e) => setFilters((f) => ({ ...f, matchDayNumber: e.target.value }))}
        />
        <div className="sm:col-span-2 lg:col-span-3">
          <Input
            id="match-search-practitioner"
            label="Practitioner name"
            type="search"
            value={filters.practitionerName}
            disabled={disabled}
            placeholder="Case-insensitive partial match"
            autoComplete="off"
            onChange={(e) => setFilters((f) => ({ ...f, practitionerName: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled}>
          Search
        </Button>
        <Button type="button" variant="secondary" disabled={disabled} onClick={handleClear}>
          Clear filters
        </Button>
      </div>
    </form>
  )
}

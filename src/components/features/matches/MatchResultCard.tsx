import { cn } from '../../../lib/utils'
import type { GraphqlMatchSearchRow } from '../../../services/graphql/matches'

export interface MatchResultCardProps {
  match: GraphqlMatchSearchRow
  className?: string
  /** Practitioner details Matches tab uses the labeled row layout from FEAT-018; search keeps default. */
  layout?: 'default' | 'practitioner'
  /** When set, tints the card for practitioner win/loss/tie (practitioner details only). */
  outcomeTone?: 'win' | 'loss' | 'tie'
}

const toneClasses: Record<NonNullable<MatchResultCardProps['outcomeTone']>, string> = {
  win: 'border-emerald-400 bg-emerald-50/80',
  loss: 'border-red-400 bg-red-50/80',
  tie: 'border-amber-400 bg-amber-50/80',
}

function MatchResultCardDefault({ match }: { match: GraphqlMatchSearchRow }) {
  return (
    <>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        {match.season}
        <span className="mx-2 font-normal text-gray-300">·</span>
        <span className="normal-case">Match day {match.matchDayNumber}</span>
      </p>
      <p className="mb-3 text-xs text-gray-500">
        <span className="font-medium text-gray-600">Competition</span>
        <span className="mx-1.5 text-gray-300">·</span>
        {[
          match.competitionScope.trim() || '—',
          match.competitionType.trim() || '—',
          match.competitionCategory.trim() || '—',
        ].join(' · ')}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs text-gray-500">Home</p>
          <p className="text-sm font-medium text-gray-900">
            <span className="mr-2 font-mono text-gray-600">{match.localPlayerLetter}</span>
            {match.localPlayerName}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">{match.localClubName.trim() || '—'}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900">
            {match.localPlayerScore}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs text-gray-500">Away</p>
          <p className="text-sm font-medium text-gray-900">
            <span className="mr-2 font-mono text-gray-600">{match.visitorPlayerLetter}</span>
            {match.visitorPlayerName}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">{match.visitorClubName.trim() || '—'}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900">
            {match.visitorPlayerScore}
          </p>
        </div>
      </div>
    </>
  )
}

function MatchResultCardPractitioner({ match }: { match: GraphqlMatchSearchRow }) {
  const homeClub = match.localClubName.trim() || '—'
  const awayClub = match.visitorClubName.trim() || '—'
  const compType = match.competitionType.trim() || '—'
  const compCat = match.competitionCategory.trim() || '—'

  return (
    <>
      <p className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1.5 text-xs">
        <span className="font-medium text-gray-600">Season</span>
        <span className="text-gray-900">{match.season}</span>
        <span className="text-gray-300" aria-hidden>
          ·
        </span>
        <span className="font-medium text-gray-600">Match day number</span>
        <span className="tabular-nums text-gray-900">{match.matchDayNumber}</span>
        <span className="text-gray-300" aria-hidden>
          ·
        </span>
        <span className="font-medium text-gray-600">Home</span>
        <span className="min-w-0 text-gray-900">{homeClub}</span>
        <span className="text-gray-300" aria-hidden>
          ·
        </span>
        <span className="font-medium text-gray-600">Away</span>
        <span className="min-w-0 text-gray-900">{awayClub}</span>
      </p>
      <p className="mb-3 text-xs text-gray-500">
        <span className="font-medium text-gray-600">Competition</span>
        <span className="mx-1.5 text-gray-300">·</span>
        <span className="normal-case text-gray-900">
          {compType}
          <span className="mx-1.5 text-gray-300">·</span>
          {compCat}
        </span>
      </p>
      <div className="grid grid-cols-[min-content_1fr_auto] items-baseline gap-x-3 gap-y-1">
        <span className="text-xs font-medium text-gray-500">Home</span>
        <span className="min-w-0 text-sm font-medium text-gray-900">
          <span className="mr-2 font-mono text-gray-600">{match.localPlayerLetter}</span>
          {match.localPlayerName}
        </span>
        <span className="text-lg font-semibold tabular-nums text-gray-900">{match.localPlayerScore}</span>
      </div>
      <div className="mt-3 grid grid-cols-[min-content_1fr_auto] items-baseline gap-x-3 gap-y-1">
        <span className="text-xs font-medium text-gray-500">Away</span>
        <span className="min-w-0 text-sm font-medium text-gray-900">
          <span className="mr-2 font-mono text-gray-600">{match.visitorPlayerLetter}</span>
          {match.visitorPlayerName}
        </span>
        <span className="text-lg font-semibold tabular-nums text-gray-900">{match.visitorPlayerScore}</span>
      </div>
    </>
  )
}

export function MatchResultCard({
  match,
  className,
  layout = 'default',
  outcomeTone,
}: MatchResultCardProps) {
  return (
    <article
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm',
        outcomeTone ? toneClasses[outcomeTone] : null,
        className,
      )}
    >
      {layout === 'practitioner' ? (
        <MatchResultCardPractitioner match={match} />
      ) : (
        <MatchResultCardDefault match={match} />
      )}
    </article>
  )
}

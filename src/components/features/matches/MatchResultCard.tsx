import { cn } from '../../../lib/utils'
import type { GraphqlMatchSearchRow } from '../../../services/graphql/matches'

export interface MatchResultCardProps {
  match: GraphqlMatchSearchRow
  className?: string
}

export function MatchResultCard({ match, className }: MatchResultCardProps) {
  return (
    <article
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm',
        className,
      )}
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        {match.season}
        <span className="mx-2 font-normal text-gray-300">·</span>
        <span className="normal-case">Match day {match.matchDayNumber}</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs text-gray-500">Home</p>
          <p className="text-sm font-medium text-gray-900">
            <span className="mr-2 font-mono text-gray-600">{match.localPlayerLetter}</span>
            {match.localPlayerName}
          </p>
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
          <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900">
            {match.visitorPlayerScore}
          </p>
        </div>
      </div>
    </article>
  )
}

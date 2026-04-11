import { Button } from '../../ui/Button'

export interface PracticionersPaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function PracticionersPagination({
  page,
  pageCount,
  onPageChange,
}: PracticionersPaginationProps) {
  if (pageCount <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
      <p className="text-sm text-gray-600">
        Page {page} of {pageCount}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

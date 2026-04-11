import { useEffect, useState } from 'react'
import type { ClubDto } from '../../../types'
import { deleteClub } from '../../../services/clubs'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'

export interface DeleteClubConfirmModalProps {
  /** Bearer token for `Authorization` on delete (see `AGENTS.md`). */
  authToken: string
  club: ClubDto | null
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

export function DeleteClubConfirmModal({
  authToken,
  club,
  onOpenChange,
  onDeleted,
}: DeleteClubConfirmModalProps) {
  const open = club !== null
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
  }, [club])

  async function handleDelete() {
    if (!club) return
    if (!authToken) {
      setError('Session expired. Sign in again.')
      return
    }
    setError(null)
    setDeleting(true)
    try {
      await deleteClub(authToken, club.id)
      onOpenChange(false)
      onDeleted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete club"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={deleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
            onClick={() => void handleDelete()}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-700">
          Delete <span className="font-semibold">{club?.name ?? 'this club'}</span>? This cannot be
          undone.
        </p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </Modal>
  )
}

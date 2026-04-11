import { useEffect, useState } from 'react'
import type { ClubDto } from '../../../types'
import { createClub, updateClub } from '../../../services/clubs'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Modal } from '../../ui/Modal'
import { formatYearRangesForInput, parseYearRangesInput } from './club-year-ranges'

export interface ClubFormModalProps {
  /** Bearer token for `Authorization` on create/update (see `AGENTS.md`). */
  authToken: string
  open: boolean
  mode: 'add' | 'edit'
  /** Required when `mode` is `edit` */
  editingClub: ClubDto | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ClubFormModal({
  authToken,
  open,
  mode,
  editingClub,
  onOpenChange,
  onSaved,
}: ClubFormModalProps) {
  const [name, setName] = useState('')
  const [yearRangesText, setYearRangesText] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setFormError(null)
    if (mode === 'edit' && editingClub) {
      setName(editingClub.name)
      setYearRangesText(formatYearRangesForInput(editingClub.yearRanges))
    } else {
      setName('')
      setYearRangesText('')
    }
  }, [open, mode, editingClub])

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setFormError('Name is required')
      return
    }
    setFormError(null)
    if (!authToken) {
      setFormError('Session expired. Sign in again.')
      return
    }
    setSaving(true)
    try {
      if (mode === 'add') {
        const dto: ClubDto = {
          id: crypto.randomUUID(),
          name: trimmed,
        }
        if (yearRangesText.trim()) {
          const parsed = parseYearRangesInput(yearRangesText)
          if (parsed?.length) dto.yearRanges = parsed
        }
        await createClub(authToken, dto)
      } else if (editingClub) {
        const dto: ClubDto = {
          ...editingClub,
          name: trimmed,
        }
        if (!yearRangesText.trim()) {
          dto.yearRanges = []
        } else {
          dto.yearRanges = parseYearRangesInput(yearRangesText) ?? []
        }
        await updateClub(authToken, dto)
      }
      onOpenChange(false)
      onSaved()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const title = mode === 'add' ? 'Add club' : 'Edit club'

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" disabled={saving} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleSave()}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {mode === 'edit' && editingClub ? (
          <div>
            <p className="text-sm font-medium text-gray-700">ID</p>
            <p className="mt-1 break-all font-mono text-xs text-gray-600">{editingClub.id}</p>
          </div>
        ) : null}
        <Input
          id="club-form-name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={saving}
        />
        <Input
          id="club-form-year-ranges"
          label="Year ranges (optional)"
          value={yearRangesText}
          onChange={(e) => setYearRangesText(e.target.value)}
          placeholder="e.g. 2023-2024, 2024-2025"
          disabled={saving}
        />
        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
      </div>
    </Modal>
  )
}

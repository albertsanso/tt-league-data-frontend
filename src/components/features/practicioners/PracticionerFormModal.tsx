import { useEffect, useState } from 'react'
import type { PracticionerDto } from '../../../types'
import { createPracticioner, updatePracticioner } from '../../../services/practicioners'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Modal } from '../../ui/Modal'

export interface PracticionerFormModalProps {
  authToken: string
  open: boolean
  mode: 'add' | 'edit'
  editing: PracticionerDto | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

function buildDto(
  mode: 'add' | 'edit',
  editing: PracticionerDto | null,
  fullName: string,
  firstName: string,
  secondName: string,
  birthDate: string,
): PracticionerDto {
  const trimmedFull = fullName.trim()
  const dto: PracticionerDto =
    mode === 'add'
      ? { id: crypto.randomUUID(), fullName: trimmedFull }
      : { id: editing!.id, fullName: trimmedFull }

  const fn = firstName.trim()
  const sn = secondName.trim()
  const bd = birthDate.trim()
  if (fn) dto.firstName = fn
  if (sn) dto.secondName = sn
  if (bd) dto.birthDate = bd
  return dto
}

export function PracticionerFormModal({
  authToken,
  open,
  mode,
  editing,
  onOpenChange,
  onSaved,
}: PracticionerFormModalProps) {
  const [fullName, setFullName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setFormError(null)
    if (mode === 'edit' && editing) {
      setFullName(editing.fullName)
      setFirstName(editing.firstName ?? '')
      setSecondName(editing.secondName ?? '')
      setBirthDate(editing.birthDate ?? '')
    } else {
      setFullName('')
      setFirstName('')
      setSecondName('')
      setBirthDate('')
    }
  }, [open, mode, editing])

  async function handleSave() {
    const trimmed = fullName.trim()
    if (!trimmed) {
      setFormError('Full name is required')
      return
    }
    if (!authToken) {
      setFormError('Session expired. Sign in again.')
      return
    }
    setFormError(null)
    setSaving(true)
    try {
      if (mode === 'add') {
        await createPracticioner(authToken, buildDto('add', null, trimmed, firstName, secondName, birthDate))
      } else if (editing) {
        await updatePracticioner(
          authToken,
          buildDto('edit', editing, trimmed, firstName, secondName, birthDate),
        )
      }
      onOpenChange(false)
      onSaved()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const title = mode === 'add' ? 'Add practicioner' : 'Edit practicioner'

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
        {mode === 'edit' && editing ? (
          <div>
            <p className="text-sm font-medium text-gray-700">ID</p>
            <p className="mt-1 break-all font-mono text-xs text-gray-600">{editing.id}</p>
          </div>
        ) : null}
        <Input
          id="practicioner-form-full-name"
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={saving}
        />
        <Input
          id="practicioner-form-first-name"
          label="First name (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={saving}
        />
        <Input
          id="practicioner-form-second-name"
          label="Second name (optional)"
          value={secondName}
          onChange={(e) => setSecondName(e.target.value)}
          disabled={saving}
        />
        <Input
          id="practicioner-form-birth-date"
          label="Birth date (optional)"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          disabled={saving}
        />
        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
      </div>
    </Modal>
  )
}

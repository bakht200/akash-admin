import { useState } from 'react'

export default function ReasonModal({
  open,
  title,
  message,
  reasonLabel = 'Reason',
  confirmLabel = 'Confirm',
  reasonRequired = true,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState('')

  if (!open) return null

  const canConfirm = reasonRequired ? Boolean(reason.trim()) : true

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[var(--figma-text-strong)]">{title}</h2>
        <p className="mt-2 text-sm text-[var(--figma-text-muted)]">{message}</p>
        <label className="mt-4 block text-sm font-semibold text-[var(--figma-text-strong)]">
          {reasonLabel}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2 h-24 w-full rounded-[10px] border border-[var(--figma-stroke)] px-3 py-2 text-sm"
            placeholder="Enter a reason…"
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-[8px] px-4 py-2 text-sm font-semibold text-[var(--figma-text)]">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirm(reason.trim())}
            className="rounded-[8px] bg-[var(--figma-brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

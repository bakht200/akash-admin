import { useCallback, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { usePaginatedList } from '../hooks/usePaginatedList'
import { createPromoCode, deletePromoCode, fetchPromoCodes, updatePromoCode } from '../services/promoCodes'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import EmptyState from '../components/states/EmptyState'
import Pagination from '../components/Pagination'
import { formatAdminDateTime, formatCents } from '../lib/display'
import { getErrorMessage } from '../lib/errors'
import { usePermissions } from '../hooks/usePermissions'

export default function PromoCodes() {
  const { canWriteSettings } = usePermissions()
  const fetcher = useCallback((params) => fetchPromoCodes(params), [])
  const list = usePaginatedList(fetcher, { limit: 25, initialFilters: { status: 'all', q: '' } })
  const [qInput, setQInput] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onToggle(code) {
    try {
      await updatePromoCode(code.id, { isActive: !code.isActive })
      list.reload()
    } catch (err) {
      window.alert(getErrorMessage(err))
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this promo code?')) return
    try {
      await deletePromoCode(id)
      list.reload()
    } catch (err) {
      window.alert(getErrorMessage(err))
    }
  }

  async function onCreate(payload) {
    setBusy(true)
    try {
      await createPromoCode(payload)
      setCreateOpen(false)
      list.reload()
    } catch (err) {
      window.alert(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--figma-text-strong)]">Promo codes</h1>
          <p className="text-sm text-[var(--figma-text-muted)]">Admin CRUD over platform promo codes.</p>
        </div>
        {canWriteSettings() ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[var(--figma-brand)] px-4 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            New code
          </button>
        ) : null}
      </div>

      <div className="figma-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:px-6">
          <input
            value={qInput}
            onChange={(e) => {
              setQInput(e.target.value)
              list.setFilters({ q: e.target.value.trim() })
            }}
            placeholder="Search codes…"
            className="h-10 flex-1 rounded-[10px] border border-[var(--figma-stroke)] px-3 text-sm"
          />
          <select
            value={list.filters.status || 'all'}
            onChange={(e) => list.setFilters({ status: e.target.value })}
            className="h-10 rounded-[10px] border border-[var(--figma-stroke)] px-3 text-sm font-medium"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {list.loading ? (
          <LoadingState />
        ) : list.error ? (
          <ErrorState message={getErrorMessage(list.error)} onRetry={list.reload} />
        ) : list.items.length === 0 ? (
          <EmptyState title="No promo codes" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead>
                <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                  {['Code', 'Discount', 'Uses', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]">
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.items.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--figma-stroke)]">
                    <td className="px-4 py-3 text-sm font-semibold">{c.code}</td>
                    <td className="px-4 py-3 text-sm">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : formatCents(c.discountValue)}
                      {c.minOrderCents ? ` · min ${formatCents(c.minOrderCents)}` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {c.usedCount ?? 0}
                      {c.maxUses != null ? ` / ${c.maxUses}` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {c.status || (c.isActive ? 'active' : 'inactive')}
                      {c.expiresAt ? ` · exp ${formatAdminDateTime(c.expiresAt)}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {canWriteSettings() ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onToggle(c)}
                              className="rounded-[8px] border px-3 py-1.5 text-xs font-semibold"
                            >
                              {c.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(c.id)}
                              className="rounded-[8px] border border-rose-200 px-2 py-1.5 text-rose-700"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-[var(--figma-text-muted)]">Read only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          limit={list.limit}
          onPageChange={list.setPage}
          label="promo codes"
        />
      </div>

      <CreatePromoModal open={createOpen} busy={busy} onCancel={() => setCreateOpen(false)} onSave={onCreate} />
    </div>
  )
}

function CreatePromoModal({ open, busy, onCancel, onSave }) {
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState('10')
  const [maxUses, setMaxUses] = useState('')
  const [fundedBy, setFundedBy] = useState('platform')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Create promo code</h2>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold">
            Code
            <input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 h-10 w-full rounded-[10px] border px-3 text-sm font-normal" />
          </label>
          <label className="block text-sm font-semibold">
            Discount type
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="mt-1 h-10 w-full rounded-[10px] border px-3 text-sm font-normal">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed (cents)</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Discount value
            <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="mt-1 h-10 w-full rounded-[10px] border px-3 text-sm font-normal" />
          </label>
          <label className="block text-sm font-semibold">
            Max uses
            <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className="mt-1 h-10 w-full rounded-[10px] border px-3 text-sm font-normal" />
          </label>
          <label className="block text-sm font-semibold">
            Funded by
            <select value={fundedBy} onChange={(e) => setFundedBy(e.target.value)} className="mt-1 h-10 w-full rounded-[10px] border px-3 text-sm font-normal">
              <option value="platform">Platform</option>
              <option value="proportional">Proportional</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-[8px] px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !code.trim()}
            onClick={() =>
              onSave({
                code: code.trim().toUpperCase(),
                discountType,
                discountValue: Number(discountValue),
                ...(maxUses ? { maxUses: Number(maxUses) } : {}),
                fundedBy,
                isActive: true,
              })
            }
            className="rounded-[8px] bg-[var(--figma-brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

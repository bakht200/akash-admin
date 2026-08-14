import { useCallback, useEffect, useMemo, useState } from 'react'
import { Ban, Pencil } from 'lucide-react'
import { usePaginatedList } from '../hooks/usePaginatedList'
import {
  createModality,
  exportModalitiesCsv,
  fetchModalityActivity,
  fetchModalityMatrix,
  fetchModalityStats,
  fetchModalityTrend,
  fetchModalities,
  updateModality,
  uploadModalityIcon,
} from '../services/modalities'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import EmptyState from '../components/states/EmptyState'
import Pagination from '../components/Pagination'
import ConfirmModal from '../components/modals/ConfirmModal'
import { formatAdminDateTime, formatRelativeTime } from '../lib/display'
import { getErrorMessage } from '../lib/errors'
import { usePermissions } from '../hooks/usePermissions'
import { resolveModalityIcon } from '../lib/modalityIcons'
import { useRegisterPageActions } from '../hooks/usePageActions'

export default function Modalities() {
  const { canWriteModalities } = usePermissions()
  const [qInput, setQInput] = useState('')
  const [stats, setStats] = useState(null)
  const [matrix, setMatrix] = useState(null)
  const [trend, setTrend] = useState(null)
  const [activity, setActivity] = useState([])
  const [exporting, setExporting] = useState(false)
  const [editor, setEditor] = useState(null) // null | { mode: 'create' } | { mode: 'edit', item }
  const [disableTarget, setDisableTarget] = useState(null)
  const [disablePreview, setDisablePreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  const fetcher = useCallback((params) => fetchModalities(params), [])
  const list = usePaginatedList(fetcher, {
    limit: 24,
    initialFilters: { q: '', isActive: 'all' },
  })

  useEffect(() => {
    const t = setTimeout(() => list.setFilters({ q: qInput.trim() }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [s, m, tr, act] = await Promise.allSettled([
        fetchModalityStats(),
        fetchModalityMatrix({ period: 30 }),
        fetchModalityTrend({ period: 30 }),
        fetchModalityActivity({ limit: 10 }),
      ])
      if (cancelled) return
      if (s.status === 'fulfilled') setStats(s.value)
      if (m.status === 'fulfilled') setMatrix(m.value)
      if (tr.status === 'fulfilled') setTrend(tr.value)
      if (act.status === 'fulfilled') {
        setActivity(act.value?.items ?? (Array.isArray(act.value) ? act.value : []))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const onExport = useCallback(async () => {
    setExporting(true)
    try {
      const { q, isActive } = list.filters
      await exportModalitiesCsv({
        ...(q ? { q } : {}),
        ...(isActive === 'true' || isActive === 'false' ? { isActive } : {}),
      })
    } catch (err) {
      window.alert(getErrorMessage(err, 'Export failed.'))
    } finally {
      setExporting(false)
    }
  }, [list.filters])

  const canWrite = canWriteModalities()
  const topbarActions = useMemo(
    () => ({
      secondary: {
        label: exporting ? 'Exporting…' : 'Export',
        icon: 'download',
        variant: 'outline',
        disabled: exporting,
        onClick: onExport,
      },
      ...(canWrite
        ? {
            primary: {
              label: 'Add New Modality',
              icon: 'plus',
              onClick: () => setEditor({ mode: 'create' }),
            },
          }
        : {}),
    }),
    [exporting, canWrite, onExport],
  )
  useRegisterPageActions(topbarActions)

  async function onSave(payload) {
    setBusy(true)
    setActionError('')
    try {
      if (editor?.mode === 'edit') {
        await updateModality(editor.item.id, payload)
      } else {
        await createModality(payload)
      }
      setEditor(null)
      list.reload()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function requestDisable(item) {
    setActionError('')
    setDisableTarget(item)
    setDisablePreview(null)
    // Soft-preview: call PATCH would mutate — instead show confirm and run on confirm.
    // We don't know affected count until disable returns; confirm first, then show count from response if needed.
    setDisablePreview({ affectedPractitionerCount: item.practitionerCount ?? 0 })
  }

  async function confirmDisable() {
    if (!disableTarget) return
    setBusy(true)
    setActionError('')
    try {
      const res = await updateModality(disableTarget.id, { isActive: false })
      const count = res?.affectedPractitionerCount
      if (count != null) setDisablePreview({ affectedPractitionerCount: count })
      setDisableTarget(null)
      list.reload()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onEnable(item) {
    try {
      await updateModality(item.id, { isActive: true })
      list.reload()
    } catch (err) {
      window.alert(getErrorMessage(err))
    }
  }

  const unattributedSessions =
    list.meta?.unattributedSessions ?? stats?.unattributedSessions ?? null

  const trendPct = trend?.pctChange
  const trendLabel =
    trendPct == null ? 'n/a' : `${trendPct > 0 ? '+' : ''}${Number(trendPct).toFixed(1)}%`

  const matrixRows = matrix?.items ?? matrix?.rows ?? (Array.isArray(matrix) ? matrix : [])

  return (
    <div className="space-y-6">
      {actionError ? (
        <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="figma-card p-5 sm:p-6 lg:col-span-1">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">30-DAY TREND</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--figma-text-strong)]">{trendLabel}</div>
          <p className="mt-1 text-xs text-[var(--figma-text-muted)]">
            Attributed booking volume vs prior window (trend, not a forecast).
          </p>
          {trend?.topMover ? (
            <div className="mt-3 text-sm">
              Top mover:{' '}
              <span className="font-semibold">{trend.topMover.name || trend.topMover.modalityName}</span>
              {trend.topMover.pctChange != null
                ? ` (${trend.topMover.pctChange > 0 ? '+' : ''}${Number(trend.topMover.pctChange).toFixed(1)}%)`
                : ''}
            </div>
          ) : null}
        </div>
        <div className="figma-card p-5 sm:p-6 lg:col-span-2">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">CAPACITY MATRIX</div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[480px] w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--figma-stroke)] text-left text-[11px] tracking-wide text-[var(--figma-text-muted)]">
                  <th className="py-2">PILLAR</th>
                  <th className="py-2">MODALITIES</th>
                  <th className="py-2">PRACTITIONERS</th>
                  <th className="py-2">SESSIONS</th>
                  <th className="py-2">SHARE</th>
                </tr>
              </thead>
              <tbody>
                {matrixRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-[var(--figma-text-muted)]">
                      No matrix data.
                    </td>
                  </tr>
                ) : (
                  matrixRows.map((row) => (
                    <tr key={row.pillar || row.name} className="border-b border-[var(--figma-stroke)] last:border-0">
                      <td className="py-2 font-semibold">{row.pillar || 'Unassigned'}</td>
                      <td className="py-2">{row.modalityCount ?? '—'}</td>
                      <td className="py-2">{row.practitionerCount ?? '—'}</td>
                      <td className="py-2">{row.attributedSessions ?? '—'}</td>
                      <td className="py-2">{row.pct != null ? `${Number(row.pct).toFixed(0)}%` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="figma-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search name or description…"
            className="h-10 flex-1 rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-3 text-sm"
          />
          <select
            value={list.filters.isActive ?? 'all'}
            onChange={(e) => list.setFilters({ isActive: e.target.value })}
            className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
          >
            <option value="all">All</option>
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </select>
        </div>

        {list.loading ? (
          <LoadingState label="Loading modalities…" />
        ) : list.error ? (
          <ErrorState message={getErrorMessage(list.error, 'Could not load modalities.')} onRetry={list.reload} />
        ) : list.items.length === 0 ? (
          <EmptyState title="No modalities found" />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.items.map((m) => {
              const iconSrc = resolveModalityIcon(m)
              return (
              <article key={m.id} className="rounded-[14px] border border-[var(--figma-stroke)] bg-white p-4">
                <div className="flex items-start gap-3">
                  {iconSrc ? (
                    <img src={iconSrc} alt="" className="h-12 w-12 shrink-0 object-contain" />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-[10px] bg-[var(--figma-input-bg)] text-sm font-semibold text-[var(--figma-text-muted)]">
                      {String(m.name || '?')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-[var(--figma-text-strong)]">{m.name}</h3>
                      {!m.isActive ? (
                        <span className="rounded-[8px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          DISABLED
                        </span>
                      ) : null}
                      {m.isOther ? (
                        <span className="rounded-[8px] bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          OTHER
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">{m.pillar || 'Unassigned pillar'}</div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-[var(--figma-text)]">{m.description || 'No description.'}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[var(--figma-text-muted)]">
                  <span>{(m.practitionerCount ?? 0).toLocaleString()} practitioners</span>
                  <span>{m.attributedSessions ?? 0} sessions (30d)</span>
                  <DemandBadge label={m.demandLabel} pct={m.demandPct} />
                </div>
                {canWriteModalities() ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditor({ mode: 'edit', item: m })}
                      className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-[var(--figma-stroke)] px-3 text-xs font-semibold"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    {m.isActive ? (
                      <button
                        type="button"
                        disabled={m.isOther}
                        onClick={() => requestDisable(m)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-rose-200 px-3 text-xs font-semibold text-rose-700 disabled:opacity-40"
                        title={m.isOther ? 'The Other modality cannot be disabled' : 'Disable'}
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Disable
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onEnable(m)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                ) : null}
              </article>
              )
            })}
          </div>
        )}

        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          limit={list.limit}
          onPageChange={list.setPage}
          label="modalities"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="figma-card p-5 sm:p-6 lg:col-span-8">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">FOOTER STATS</div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Active categories" value={stats?.activeCategories ?? '—'} />
            <Stat label="Total practitioners" value={stats?.totalPractitioners ?? '—'} />
            <Stat label="Monthly sessions" value={stats?.monthlySessions ?? '—'} />
          </div>
          {unattributedSessions != null ? (
            <p className="mt-4 text-xs text-[var(--figma-text-muted)]">
              Unattributed sessions (no modality picked): {unattributedSessions}
            </p>
          ) : null}
        </div>
        <div className="figma-card p-5 sm:p-6 lg:col-span-4">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">RECENT ACTIVITY</div>
          <ul className="mt-4 space-y-3">
            {activity.length === 0 ? (
              <li className="text-sm text-[var(--figma-text-muted)]">No recent modality audit events.</li>
            ) : (
              activity.map((a, idx) => (
                <li key={a.id || idx} className="text-sm">
                  <div className="font-semibold text-[var(--figma-text-strong)]">
                    {a.action || a.type || 'Update'} — {a.targetName || a.modalityName || a.entityName || 'modality'}
                  </div>
                  <div className="text-xs text-[var(--figma-text-muted)]">
                    {a.createdAt ? formatRelativeTime(a.createdAt) : a.at ? formatAdminDateTime(a.at) : '—'}
                    {a.actor?.email || a.adminEmail ? ` · ${a.actor?.email || a.adminEmail}` : ''}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <ModalityEditorModal
        open={Boolean(editor)}
        mode={editor?.mode}
        item={editor?.item}
        busy={busy}
        error={actionError}
        onCancel={() => {
          setEditor(null)
          setActionError('')
        }}
        onSave={onSave}
      />

      <ConfirmModal
        open={Boolean(disableTarget)}
        title="Disable modality?"
        message={`This will hide “${disableTarget?.name ?? ''}” from new onboarding and discovery. About ${disablePreview?.affectedPractitionerCount ?? disableTarget?.practitionerCount ?? 0} practitioners currently have it assigned — assignments are kept.`}
        confirmLabel={busy ? 'Disabling…' : 'Disable'}
        danger
        onCancel={() => setDisableTarget(null)}
        onConfirm={confirmDisable}
      />
    </div>
  )
}

function DemandBadge({ label, pct }) {
  const tone =
    label === 'HIGH'
      ? 'bg-emerald-50 text-emerald-800'
      : label === 'MODERATE'
        ? 'bg-sky-50 text-sky-800'
        : label === 'LOW'
          ? 'bg-amber-50 text-amber-900'
          : 'bg-slate-100 text-slate-700'
  return (
    <span className={['rounded-[8px] px-2 py-0.5', tone].join(' ')}>
      {label || 'NONE'}
      {pct != null ? ` ${pct}%` : ''}
    </span>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]">{label.toUpperCase()}</div>
      <div className="mt-1 text-xl font-semibold text-[var(--figma-text-strong)]">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  )
}

function ModalityEditorModal({ open, mode, item, busy, error, onCancel, onSave }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pillar, setPillar] = useState('')
  const [displayOrder, setDisplayOrder] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(item?.name ?? '')
    setDescription(item?.description ?? '')
    setPillar(item?.pillar ?? '')
    setDisplayOrder(item?.displayOrder != null ? String(item.displayOrder) : '')
    setIconUrl(item?.iconUrl ?? resolveModalityIcon(item) ?? '')
  }, [open, item])

  if (!open) return null

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadModalityIcon(file)
      setIconUrl(url)
    } catch (err) {
      window.alert(getErrorMessage(err, 'Icon upload failed.'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-[12px] bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">{mode === 'edit' ? 'Edit modality' : 'Add New Modality'}</h2>
        {error ? <p className="mt-2 text-sm font-semibold text-rose-700">{error}</p> : null}
        <div className="mt-4 space-y-3">
          <Field label="Name *" value={name} onChange={setName} />
          <label className="block text-sm font-semibold">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 h-24 w-full rounded-[10px] border border-[var(--figma-stroke)] px-3 py-2 text-sm font-normal"
            />
          </label>
          <Field label="Pillar" value={pillar} onChange={setPillar} />
          <Field label="Display order" value={displayOrder} onChange={setDisplayOrder} type="number" />
          <div>
            <div className="text-sm font-semibold">Icon</div>
            {iconUrl ? <img src={iconUrl} alt="" className="mt-2 h-16 w-16 object-contain" /> : null}
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2">
              <input type="file" accept="image/*" onChange={onFile} className="sr-only" disabled={uploading} />
              <span className="inline-flex h-10 items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white px-4 text-sm font-semibold text-[var(--figma-text-strong)] hover:bg-[rgba(244,243,241,0.7)]">
                {uploading ? 'Uploading…' : iconUrl ? 'Change file' : 'Choose file'}
              </span>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-[8px] px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || uploading || !name.trim()}
            onClick={() =>
              onSave({
                name: name.trim(),
                ...(description !== '' ? { description } : mode === 'edit' ? { description: description || '' } : {}),
                ...(pillar !== '' ? { pillar } : {}),
                ...(displayOrder !== '' ? { displayOrder: Number(displayOrder) } : {}),
                ...(iconUrl ? { iconUrl } : mode === 'edit' && item?.iconUrl && !iconUrl ? { iconUrl: null } : {}),
              })
            }
            className="rounded-[8px] bg-[var(--figma-brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-[10px] border border-[var(--figma-stroke)] px-3 text-sm font-normal"
      />
    </label>
  )
}

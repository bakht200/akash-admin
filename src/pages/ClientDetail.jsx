import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, CircleSlash, Hash, Mail, Pencil, Power, Trash2 } from 'lucide-react'
import ReasonModal from '../components/modals/ReasonModal'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import {
  clientStatusClass,
  clientStatusLabel,
  formatAdminDateTime,
  formatCents,
  formatRelativeTime,
  formatShortUuid,
  personName,
} from '../lib/display'
import { getErrorMessage } from '../lib/errors'
import { usePermissions } from '../hooks/usePermissions'
import {
  createClientNote,
  deleteClientNote,
  fetchClient,
  fetchClientNotes,
  reactivateClient,
  suspendClient,
  updateClient,
} from '../services/clients'

function Avatar({ name, className = 'h-16 w-16 text-lg' }) {
  const initials = String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <div
      className={[
        'grid shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] font-semibold text-[var(--figma-text-muted)] ring-2 ring-white',
        className,
      ].join(' ')}
    >
      {initials || '—'}
    </div>
  )
}

export default function ClientDetail() {
  const { id } = useParams()
  const { canWriteClients, canSuspendUsers } = usePermissions()
  const [client, setClient] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [detail, noteList] = await Promise.all([fetchClient(id), fetchClientNotes(id).catch(() => ({ items: [] }))])
      setClient(detail)
      setNotes(noteList?.items ?? noteList ?? [])
    } catch (err) {
      setError(err)
      setClient(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <LoadingState label="Loading client…" />
  if (error) return <ErrorState message={getErrorMessage(error, 'Could not load client.')} onRetry={load} />
  if (!client) return <ErrorState message="Client not found." />

  const profile = client.profile ?? client
  const name = personName(profile)
  const status = profile.status ?? client.status
  const spend = client.spend ?? {}
  const activity = client.activityFeed ?? []
  const isSuspended = status === 'suspended'

  async function onSuspend(reason) {
    setBusy(true)
    setActionError('')
    try {
      await suspendClient(id, reason)
      setSuspendOpen(false)
      await load()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onReactivate(reason) {
    setBusy(true)
    setActionError('')
    try {
      await reactivateClient(id, reason)
      setReactivateOpen(false)
      await load()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onSaveEdit(payload) {
    setBusy(true)
    setActionError('')
    try {
      await updateClient(id, payload)
      setEditOpen(false)
      await load()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onAddNote(body) {
    setBusy(true)
    setActionError('')
    try {
      await createClientNote(id, body)
      setNoteOpen(false)
      const noteList = await fetchClientNotes(id)
      setNotes(noteList?.items ?? noteList ?? [])
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onDeleteNote(noteId) {
    if (!window.confirm('Delete this note?')) return
    try {
      await deleteClientNote(id, noteId)
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    } catch (err) {
      window.alert(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[var(--figma-text-muted)]">
            <Link to="/clients" className="hover:text-[var(--figma-text)]">
              Clients
            </Link>{' '}
            <span>›</span> Client Profile
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar name={name} />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">{name}</h1>
              <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--figma-text-muted)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="text-[var(--figma-text)]">{profile.email}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="font-medium text-[var(--figma-text-strong)]">{formatShortUuid(profile.id ?? id)}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Joined: {profile.createdAt ? formatAdminDateTime(profile.createdAt) : '—'}</span>
                </span>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-[var(--figma-text-muted)]">Phone: </span>
                <span className="font-medium text-[var(--figma-text)]">
                  {[profile.phoneCountryCode, profile.phone].filter(Boolean).join(' ') || '—'}
                </span>
              </div>
              <div className="mt-1 text-sm">
                <span className="text-[var(--figma-text-muted)]">Last active: </span>
                <span className="text-[var(--figma-text)]">
                  {client.lastActiveAt || profile.lastActiveAt
                    ? formatAdminDateTime(client.lastActiveAt || profile.lastActiveAt)
                    : '—'}
                </span>
              </div>
              <div className="mt-2">
                <span
                  className={[
                    'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                    clientStatusClass(status),
                  ].join(' ')}
                >
                  {clientStatusLabel(status).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
          {canWriteClients() ? (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#E3E2E0] px-4 text-[11px] font-semibold tracking-[0.12em] text-[#1A1C1B] hover:brightness-[0.98]"
            >
              <Pencil className="h-4 w-4" />
              EDIT INFO
            </button>
          ) : null}
          {canSuspendUsers() && !isSuspended ? (
            <button
              type="button"
              onClick={() => setSuspendOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-rose-200 bg-white px-4 text-[11px] font-semibold tracking-[0.12em] text-rose-700 hover:bg-rose-50"
            >
              <CircleSlash className="h-4 w-4" />
              SUSPEND
            </button>
          ) : null}
          {canSuspendUsers() && isSuspended ? (
            <button
              type="button"
              onClick={() => setReactivateOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 text-[11px] font-semibold tracking-[0.12em] text-emerald-800 hover:brightness-[0.98]"
            >
              <Power className="h-4 w-4" />
              REACTIVATE
            </button>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      ) : null}

      <ReasonModal
        open={suspendOpen}
        title="Suspend client"
        message="This locks the account, logs them out, and fully refunds future confirmed sessions."
        confirmLabel={busy ? 'Suspending…' : 'Suspend'}
        onCancel={() => setSuspendOpen(false)}
        onConfirm={onSuspend}
      />
      <ReasonModal
        open={reactivateOpen}
        title="Reactivate client"
        message="Restores login access. Cancelled sessions are not resurrected. Reason is optional."
        confirmLabel={busy ? 'Reactivating…' : 'Reactivate'}
        reasonLabel="Reason (optional)"
        reasonRequired={false}
        onCancel={() => setReactivateOpen(false)}
        onConfirm={onReactivate}
      />
      <EditClientModal
        key={editOpen ? `edit-${id}` : 'edit-closed'}
        open={editOpen}
        profile={profile}
        busy={busy}
        onCancel={() => setEditOpen(false)}
        onSave={onSaveEdit}
      />
      <AddNoteModal
        key={noteOpen ? `note-${id}` : 'note-closed'}
        open={noteOpen}
        busy={busy}
        onCancel={() => setNoteOpen(false)}
        onSave={onAddNote}
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="figma-card p-5 sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">TOTAL SPEND</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--figma-brand)]">{formatCents(spend.totalSpendCents)}</div>
        </div>
        <div className="figma-card p-5 sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">PAYMENTS</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--figma-brand)]">{spend.paymentCount ?? 0}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="figma-card p-5 sm:p-6">
            <div className="text-base font-semibold text-[var(--figma-text-strong)]">Activity Feed</div>
            <ul className="mt-4 space-y-4">
              {activity.length === 0 ? (
                <li className="text-sm text-[var(--figma-text-muted)]">No activity yet.</li>
              ) : (
                activity.map((evt, idx) => (
                  <li key={`${evt.type}-${evt.at ?? evt.createdAt}-${idx}`} className="flex gap-3">
                    <span
                      className={[
                        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                        evt.type === 'booking' ? 'bg-emerald-500' : evt.type === 'review' ? 'bg-[var(--figma-brand)]' : 'bg-sky-400',
                      ].join(' ')}
                    />
                    <div>
                      <div className="text-sm font-medium text-[var(--figma-text-strong)]">
                        {activityLabel(evt)}
                      </div>
                      <div className="text-xs text-[var(--figma-text-muted)]">
                        {evt.at || evt.createdAt ? formatRelativeTime(evt.at || evt.createdAt) : '—'}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="figma-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="text-base font-semibold text-[var(--figma-text-strong)]">Internal Notes</div>
              {canWriteClients() ? (
                <button
                  type="button"
                  onClick={() => setNoteOpen(true)}
                  className="text-xs font-semibold text-[var(--figma-brand)] hover:brightness-95"
                >
                  + Add Note
                </button>
              ) : null}
            </div>
            <div className="mt-4 space-y-4">
              {notes.length === 0 ? (
                <p className="text-sm text-[var(--figma-text-muted)]">No notes.</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="border-b border-[var(--figma-stroke)] pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[11px] font-bold tracking-wide text-[var(--figma-text-strong)]">
                        {n.createdAt ? formatAdminDateTime(n.createdAt) : '—'} —{' '}
                        {personName(n.author) || n.author?.email || 'Admin'}
                      </div>
                      {canWriteClients() ? (
                        <button
                          type="button"
                          onClick={() => onDeleteNote(n.id)}
                          className="text-[var(--figma-text-muted)] hover:text-rose-600"
                          aria-label="Delete note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--figma-text)]">{n.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function activityLabel(evt) {
  if (evt.label) return evt.label
  switch (evt.type) {
    case 'signup':
      return 'Signed up'
    case 'booking':
      return 'Booked a session'
    case 'review':
      return 'Left a review'
    default:
      return evt.type || 'Activity'
  }
}

function EditClientModal({ open, profile, busy, onCancel, onSave }) {
  const [firstName, setFirstName] = useState(profile?.firstName ?? '')
  const [lastName, setLastName] = useState(profile?.lastName ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [phoneCountryCode, setPhoneCountryCode] = useState(profile?.phoneCountryCode ?? '')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[var(--figma-text-strong)]">Edit client</h2>
        <p className="mt-1 text-sm text-[var(--figma-text-muted)]">Name and phone only. Email is immutable.</p>
        <div className="mt-4 space-y-3">
          <Field label="First name" value={firstName} onChange={setFirstName} />
          <Field label="Last name" value={lastName} onChange={setLastName} />
          <Field label="Phone country code" value={phoneCountryCode} onChange={setPhoneCountryCode} />
          <Field label="Phone" value={phone} onChange={setPhone} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-[8px] px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSave({ firstName, lastName, phone, phoneCountryCode })}
            className="rounded-[8px] bg-[var(--figma-brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddNoteModal({ open, busy, onCancel, onSave }) {
  const [body, setBody] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[var(--figma-text-strong)]">Add note</h2>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-4 h-28 w-full rounded-[10px] border border-[var(--figma-stroke)] px-3 py-2 text-sm"
          placeholder="Internal note…"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-[8px] px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !body.trim()}
            onClick={() => onSave(body.trim())}
            className="rounded-[8px] bg-[var(--figma-brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Add note'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="block text-sm font-semibold text-[var(--figma-text-strong)]">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-[10px] border border-[var(--figma-stroke)] px-3 text-sm font-normal"
      />
    </label>
  )
}

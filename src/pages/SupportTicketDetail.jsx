import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, Send } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorState from '../components/states/ErrorState'
import LoadingState from '../components/states/LoadingState'
import { formatAdminDateTime } from '../lib/display'
import { getErrorMessage } from '../lib/errors'
import { fetchSupportTicket, sendSupportReply } from '../services/support'
import { usePermissions } from '../hooks/usePermissions'

export default function SupportTicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canWriteNotifications } = usePermissions()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      setTicket(await fetchSupportTicket(id))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function submitReply(event) {
    event.preventDefault()
    const message = reply.trim()
    if (!message || sending) return
    setSending(true)
    try {
      await sendSupportReply(id, message)
      setReply('')
      await load()
    } catch (err) {
      window.alert(getErrorMessage(err, 'Could not send support reply.'))
    } finally {
      setSending(false)
    }
  }

  if (loading) return <LoadingState label="Loading support ticket…" />
  if (error) return <ErrorState message={getErrorMessage(error, 'Could not load support ticket.')} onRetry={load} />
  if (!ticket) return <ErrorState message="Support ticket not found." />

  const submitterName =
    [ticket.user?.firstName, ticket.user?.lastName].filter(Boolean).join(' ') ||
    ticket.user?.email ||
    'User'

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        type="button"
        onClick={() => navigate('/notifications')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--figma-brand)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to notifications
      </button>

      <section className="figma-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[var(--figma-text-strong)]">{ticket.subject}</h1>
            <p className="mt-1 text-sm text-[var(--figma-text-muted)]">
              {submitterName} · {ticket.user?.role || 'user'} · {formatAdminDateTime(ticket.createdAt)}
            </p>
            {ticket.user?.email ? (
              <p className="mt-1 text-xs text-[var(--figma-text-muted)]">{ticket.user.email}</p>
            ) : null}
          </div>
          <span className="inline-flex self-start rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold capitalize text-sky-800">
            {String(ticket.status || 'open').replace(/_/g, ' ')}
          </span>
        </div>

        {ticket.attachmentUrl ? (
          <a
            href={ticket.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-[10px] border border-[var(--figma-stroke)] px-3 py-2 text-sm font-semibold text-[var(--figma-brand)]"
          >
            <ExternalLink className="h-4 w-4" />
            View attachment
          </a>
        ) : null}
      </section>

      <section className="figma-card p-5 sm:p-6">
        <h2 className="font-semibold text-[var(--figma-text-strong)]">Conversation</h2>
        <div className="mt-4 space-y-3">
          <Message body={ticket.message} time={ticket.createdAt} admin={false} />
          {(ticket.replies || []).map((item) => (
            <Message key={item.id} body={item.message} time={item.createdAt} admin={item.isAdmin} />
          ))}
        </div>

        {canWriteNotifications() ? (
          <form onSubmit={submitReply} className="mt-6 border-t border-[var(--figma-stroke)] pt-5">
            <label htmlFor="support-reply" className="text-sm font-semibold text-[var(--figma-text-strong)]">
              Reply
            </label>
            <textarea
              id="support-reply"
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              maxLength={5000}
              rows={4}
              placeholder="Write a response…"
              className="mt-2 w-full rounded-[10px] border border-[var(--figma-stroke)] bg-white p-3 text-sm"
            />
            <button
              type="submit"
              disabled={!reply.trim() || sending}
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-[8px] bg-[var(--figma-brand)] px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Sending…' : 'Send reply'}
            </button>
          </form>
        ) : null}
      </section>
    </div>
  )
}

function Message({ body, time, admin }) {
  return (
    <div className={['max-w-[85%] rounded-[12px] p-3', admin ? 'bg-violet-50' : 'ml-auto bg-slate-100'].join(' ')}>
      <p className="whitespace-pre-wrap text-sm text-[var(--figma-text)]">{body}</p>
      <p className="mt-2 text-xs text-[var(--figma-text-muted)]">
        {admin ? 'Admin' : 'User'} · {formatAdminDateTime(time)}
      </p>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, Send } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ErrorState from '../components/states/ErrorState'
import LoadingState from '../components/states/LoadingState'
import { formatAdminDateTime, roleLabel } from '../lib/display'
import { getSupportTicketNumber } from '../lib/supportTicket'
import { getErrorMessage } from '../lib/errors'
import { fetchSupportTicket, sendSupportReply } from '../services/support'
import { reviewIdentityVerification } from '../services/practitioners'
import { usePermissions } from '../hooks/usePermissions'

export default function SupportTicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canWriteNotifications, canWritePractitioners } = usePermissions()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [approving, setApproving] = useState(false)

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

  async function approveIdentity() {
    if (!ticket?.userId) return
    if (!window.confirm("Approve this practitioner's identity verification? The verified badge will appear on their public profile.")) {
      return
    }
    setApproving(true)
    try {
      await reviewIdentityVerification(ticket.userId, { action: 'approve' })
      await load()
    } catch (err) {
      window.alert(getErrorMessage(err, 'Could not approve identity verification.'))
    } finally {
      setApproving(false)
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
        onClick={() => navigate('/support-tickets')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--figma-brand)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to support
      </button>

      <section className="figma-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {getSupportTicketNumber(ticket) ? (
              <p className="text-xs font-semibold tracking-wide text-[var(--figma-text-muted)]">
                Ticket {getSupportTicketNumber(ticket)}
              </p>
            ) : null}
            <h1 className="text-xl font-semibold text-[var(--figma-text-strong)]">{ticket.subject}</h1>
            <p className="mt-1 text-sm text-[var(--figma-text-muted)]">
              {submitterName} · {roleLabel(ticket.user?.role, 'User')} · {formatAdminDateTime(ticket.createdAt)}
            </p>
            {ticket.user?.email ? (
              <p className="mt-1 text-xs text-[var(--figma-text-muted)]">{ticket.user.email}</p>
            ) : null}
            {ticket.userId && (ticket.user?.role === 'healer' || ticket.user?.role === 'practitioner') ? (
              <Link
                to={`/practitioners/${ticket.userId}#identity-verification`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--figma-brand)]"
              >
                Open practitioner profile
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>
          <span className="inline-flex self-start rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold capitalize text-sky-800">
            {String(ticket.status || 'open').replace(/_/g, ' ')}
          </span>
        </div>

        {ticket.attachmentUrl ? (
          <div className="mt-5">
            <AttachmentCard url={ticket.attachmentUrl} />
          </div>
        ) : null}

        {ticket.source === 'identity_verification' && ticket.identityVerification ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-3 py-3">
            <p className="text-sm text-[var(--figma-text)]">
              Identity status:{' '}
              <span className="font-semibold capitalize">
                {String(ticket.identityVerification.status || '').replace(/_/g, ' ')}
              </span>
            </p>
            {canWritePractitioners() && ticket.identityVerification.status !== 'verified' ? (
              <button
                type="button"
                disabled={approving}
                onClick={approveIdentity}
                className="inline-flex h-9 items-center rounded-[8px] bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {approving ? 'Approving…' : 'Approve identity'}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="figma-card p-5 sm:p-6">
        <h2 className="font-semibold text-[var(--figma-text-strong)]">Conversation</h2>
        <div className="mt-4 space-y-3">
          <Message
            body={ticket.message}
            time={ticket.createdAt}
            admin={Boolean(ticket.openedByAdmin)}
          />
          {(ticket.replies || []).map((item) => (
            <Message
              key={item.id}
              body={item.message}
              time={item.createdAt}
              admin={item.isAdmin}
              attachmentUrl={item.attachmentUrl}
            />
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
              placeholder={
                ticket.source === 'identity_verification'
                  ? 'Ask for more documents, or confirm what you received…'
                  : 'Write a response…'
              }
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

function isImageAttachment(url) {
  return /\.(png|jpe?g|gif|webp)(\?|#|$)/i.test(String(url || '').split('?')[0])
}

function AttachmentCard({ url }) {
  if (!url) return null
  const image = isImageAttachment(url)
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center gap-3 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 py-2 text-sm font-semibold text-[var(--figma-brand)]"
    >
      {image ? (
        <img src={url} alt="" className="h-14 w-14 rounded-[8px] object-cover" />
      ) : (
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-[8px] bg-slate-50">
          <ExternalLink className="h-4 w-4" />
        </span>
      )}
      <span>View attachment</span>
      <ExternalLink className="h-4 w-4 shrink-0" />
    </a>
  )
}

function Message({ body, time, admin, attachmentUrl }) {
  const text = String(body || '').trim()
  return (
    <div className={['max-w-[85%] rounded-[12px] p-3', admin ? 'bg-violet-50' : 'ml-auto bg-slate-100'].join(' ')}>
      {text ? <p className="whitespace-pre-wrap text-sm text-[var(--figma-text)]">{text}</p> : null}
      {attachmentUrl ? (
        <div className={text ? 'mt-3' : undefined}>
          <AttachmentCard url={attachmentUrl} />
        </div>
      ) : null}
      <p className="mt-2 text-xs text-[var(--figma-text-muted)]">
        {admin ? 'Admin' : 'User'} · {formatAdminDateTime(time)}
      </p>
    </div>
  )
}

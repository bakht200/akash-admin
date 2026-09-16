import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Paperclip, Send, X } from 'lucide-react'
import { applyTemplateName } from '../lib/messageTemplates'
import { fetchMessageTemplates } from '../services/support'

export default function MessageComposer({
  firstName = '',
  showSubject = true,
  subject,
  body,
  onSubjectChange,
  onBodyChange,
  onSubmit,
  submitting = false,
  submitLabel = 'Send message',
  bodyPlaceholder = 'Write a message…',
  canManageTemplates = false,
  requireSubject,
  requireBody,
  allowAttachments = false,
  attachmentFile = null,
  onAttachmentChange,
}) {
  const [templates, setTemplates] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [hint, setHint] = useState('')
  const subjectRequired = requireSubject ?? showSubject
  const bodyRequired = requireBody ?? true

  useEffect(() => {
    let cancelled = false
    fetchMessageTemplates()
      .then((rows) => {
        if (!cancelled) setTemplates(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!cancelled) setTemplates([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  function applyTemplate(id) {
    setSelectedId(id)
    if (!id) {
      setHint('')
      return
    }
    const template = templates.find((item) => item.id === id)
    if (!template) return
    onSubjectChange?.(applyTemplateName(template.subject, firstName))
    onBodyChange?.(applyTemplateName(template.body, firstName))
    setHint(template.hint || '')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (submitting || !canSend) return
    onSubmit?.()
  }

  const hasBody = Boolean(String(body || '').trim())
  const hasFile = Boolean(attachmentFile)
  const canSend =
    (hasBody || (!bodyRequired && hasFile)) &&
    (!subjectRequired || Boolean(String(subject || '').trim()))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="message-template" className="text-sm font-semibold text-[var(--figma-text-strong)]">
            Template
          </label>
          {canManageTemplates ? (
            <Link to="/support-tickets/templates" className="text-xs font-semibold text-[var(--figma-brand)]">
              Edit templates
            </Link>
          ) : null}
        </div>
        <select
          id="message-template"
          value={selectedId}
          onChange={(event) => applyTemplate(event.target.value)}
          className="mt-2 w-full rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 py-2.5 text-sm"
        >
          <option value="">Write from scratch</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.title}
            </option>
          ))}
        </select>
        {hint ? <p className="mt-2 text-xs text-[var(--figma-text-muted)]">{hint}</p> : null}
      </div>

      {showSubject ? (
        <div>
          <label htmlFor="message-subject" className="text-sm font-semibold text-[var(--figma-text-strong)]">
            Subject
          </label>
          <input
            id="message-subject"
            value={subject}
            onChange={(event) => onSubjectChange?.(event.target.value)}
            maxLength={200}
            placeholder="Subject"
            className="mt-2 w-full rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 py-2.5 text-sm"
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="message-body" className="text-sm font-semibold text-[var(--figma-text-strong)]">
          Message
        </label>
        <textarea
          id="message-body"
          value={body}
          onChange={(event) => onBodyChange?.(event.target.value)}
          maxLength={8000}
          rows={showSubject ? 10 : 6}
          placeholder={bodyPlaceholder}
          className="mt-2 w-full rounded-[10px] border border-[var(--figma-stroke)] bg-white p-3 text-sm"
        />
      </div>

      {allowAttachments ? (
        <div>
          <label className="text-sm font-semibold text-[var(--figma-text-strong)]">Attachment</label>
          <p className="mt-1 text-xs text-[var(--figma-text-muted)]">JPG, PNG, GIF, or PDF. Optional.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-[8px] border border-[var(--figma-stroke)] bg-white px-3 py-2 text-sm font-semibold text-[var(--figma-text-strong)] hover:bg-[rgba(244,243,241,0.7)]">
              <Paperclip className="h-4 w-4" />
              {attachmentFile ? 'Change file' : 'Attach file'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,application/pdf"
                className="sr-only"
                disabled={submitting}
                onChange={(event) => {
                  onAttachmentChange?.(event.target.files?.[0] || null)
                  event.target.value = ''
                }}
              />
            </label>
            {attachmentFile ? (
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[var(--figma-text)]">
                <span className="truncate">{attachmentFile.name}</span>
                <button
                  type="button"
                  onClick={() => onAttachmentChange?.(null)}
                  className="text-[var(--figma-text-muted)] hover:text-[var(--figma-text-strong)]"
                  aria-label="Remove attachment"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canSend || submitting}
        className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[var(--figma-brand)] px-4 text-sm font-semibold text-white disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {submitting ? 'Sending…' : submitLabel}
      </button>
    </form>
  )
}

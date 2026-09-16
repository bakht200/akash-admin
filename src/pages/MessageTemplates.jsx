import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ErrorState from '../components/states/ErrorState'
import LoadingState from '../components/states/LoadingState'
import { getErrorMessage } from '../lib/errors'
import { usePermissions } from '../hooks/usePermissions'
import { fetchMessageTemplates, updateMessageTemplate } from '../services/support'

export default function MessageTemplates() {
  const navigate = useNavigate()
  const { canWriteNotifications } = usePermissions()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = useCallback(async () => {
    setError(null)
    try {
      setTemplates(await fetchMessageTemplates({ includeInactive: true }))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function startEdit(template) {
    setEditingId(template.id)
    setSaveError('')
    setDraft({
      title: template.title,
      subject: template.subject,
      body: template.body,
      hint: template.hint || '',
    })
  }

  async function save() {
    if (!editingId || !draft) return
    setSaving(true)
    setSaveError('')
    try {
      const updated = await updateMessageTemplate(editingId, {
        title: draft.title,
        subject: draft.subject,
        body: draft.body,
        hint: draft.hint || null,
      })
      setTemplates((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...updated } : item)))
      setEditingId(null)
      setDraft(null)
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not save template.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Loading templates…" />
  if (error) return <ErrorState message={getErrorMessage(error, 'Could not load templates.')} onRetry={load} />

  const canEdit = canWriteNotifications()

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

      <div>
        <h1 className="text-xl font-semibold text-[var(--figma-text-strong)]">Practitioner message templates</h1>
        <p className="mt-1 text-sm text-[var(--figma-text-muted)]">
          These pre-fill the composer. [Name] becomes the practitioner&apos;s first name. Leave other
          placeholders in the draft until you fill them in.
        </p>
      </div>

      <div className="space-y-3">
        {templates.map((template) => {
          const open = editingId === template.id
          return (
            <section key={template.id} className="figma-card p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold text-[var(--figma-text-strong)]">{template.title}</h2>
                  <p className="mt-1 text-sm text-[var(--figma-text-muted)]">{template.subject}</p>
                </div>
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => (open ? (setEditingId(null), setDraft(null)) : startEdit(template))}
                    className="self-start text-sm font-semibold text-[var(--figma-brand)]"
                  >
                    {open ? 'Cancel' : 'Edit'}
                  </button>
                ) : null}
              </div>

              {open && draft ? (
                <div className="mt-4 space-y-3">
                  <Field label="Picker label" value={draft.title} onChange={(title) => setDraft((d) => ({ ...d, title }))} />
                  <Field label="Subject" value={draft.subject} onChange={(subject) => setDraft((d) => ({ ...d, subject }))} />
                  <Field
                    label="Body"
                    value={draft.body}
                    onChange={(body) => setDraft((d) => ({ ...d, body }))}
                    textarea
                  />
                  <Field
                    label="Sender hint"
                    value={draft.hint}
                    onChange={(hint) => setDraft((d) => ({ ...d, hint }))}
                  />
                  {saveError ? <p className="text-sm font-semibold text-rose-700">{saveError}</p> : null}
                  <button
                    type="button"
                    disabled={saving || !draft.title.trim() || !draft.subject.trim() || !draft.body.trim()}
                    onClick={save}
                    className="inline-flex h-10 items-center rounded-[8px] bg-[var(--figma-brand)] px-4 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save template'}
                  </button>
                </div>
              ) : (
                <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-[var(--figma-text)]">{template.body}</pre>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, textarea = false }) {
  const shared = 'mt-2 w-full rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 py-2.5 text-sm'
  return (
    <label className="block text-sm font-semibold text-[var(--figma-text-strong)]">
      {label}
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={10} className={shared} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={shared} />
      )}
    </label>
  )
}

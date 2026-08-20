import { useState } from 'react'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import { formatAdminDateTime } from '../../lib/display'
import { hasIdentityDocuments } from '../../lib/identityVerification'

function identityStatusClass(status) {
  const key = String(status ?? '').toLowerCase()
  if (key === 'verified') return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
  if (key === 'pending' || key === 'submitted') return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'
  if (key === 'rejected' || key === 'failed') return 'bg-rose-50 text-rose-800 ring-1 ring-rose-200/80'
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80'
}

function formatIdentityStatus(status) {
  const key = String(status ?? '').trim()
  if (!key) return 'Unknown'
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}


function DocumentTile({ label, url, onRefresh }) {
  const [failed, setFailed] = useState(false)

  if (!url) return null

  return (
    <div className="overflow-hidden rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
      <div className="border-b border-[var(--figma-stroke)] bg-white px-3 py-2 text-[11px] font-semibold tracking-wide text-[var(--figma-text-muted)]">
        {label}
      </div>
      {failed ? (
        <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 px-4 py-6 text-center">
          <p className="text-xs font-semibold text-[var(--figma-text-muted)]">Document unavailable</p>
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs font-semibold text-[var(--figma-brand)] hover:underline"
          >
            Refresh to reload
          </button>
        </div>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={url}
            alt={label}
            className="aspect-[4/3] w-full object-cover object-center"
            onError={() => setFailed(true)}
          />
        </a>
      )}
    </div>
  )
}

export default function IdentityVerificationPanel({ identity, refreshing, onRefresh }) {
  const hasDocs = hasIdentityDocuments(identity)
  const status = identity?.status
  const expiresAt = identity?.documentUrlsExpireAt

  return (
    <div className="figma-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--figma-stroke)] bg-white px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-[rgba(27,20,100,0.08)] text-[var(--figma-brand)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Identity Verification</div>
            <div className="text-xs text-[var(--figma-text-muted)]">Private KYC documents for admin review</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status ? (
            <span
              className={[
                'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                identityStatusClass(status),
              ].join(' ')}
            >
              {formatIdentityStatus(status)}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-[var(--figma-stroke)] bg-white px-3 text-xs font-semibold text-[var(--figma-text-strong)] hover:bg-[var(--figma-input-bg)] disabled:opacity-50"
          >
            <RefreshCw className={['h-3.5 w-3.5', refreshing ? 'animate-spin' : ''].join(' ')} />
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetaItem label="ID country" value={identity?.idCountry || '—'} />
          <MetaItem
            label="Verified at"
            value={identity?.verifiedAt ? formatAdminDateTime(identity.verifiedAt) : '—'}
          />
          <MetaItem label="Documents" value={hasDocs ? 'Uploaded' : 'Not provided'} />
        </div>

        {expiresAt ? (
          <p className="text-xs text-[var(--figma-text-muted)]">
            Document links expire at {formatAdminDateTime(expiresAt)} (~15 min). Refresh before viewing if images fail to load.
          </p>
        ) : null}

        {!hasDocs ? (
          <div className="rounded-[12px] border border-dashed border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-4 py-8 text-center">
            <p className="text-sm font-semibold text-[var(--figma-text-strong)]">Not provided</p>
            <p className="mt-1 text-xs text-[var(--figma-text-muted)]">
              Legacy signup or no ID images on file. Country and status may still be set without documents.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <DocumentTile key={identity.idFrontUrl || 'front'} label="ID front" url={identity.idFrontUrl} onRefresh={onRefresh} />
            <DocumentTile key={identity.idBackUrl || 'back'} label="ID back" url={identity.idBackUrl} onRefresh={onRefresh} />
            <DocumentTile key={identity.selfieUrl || 'selfie'} label="Selfie" url={identity.selfieUrl} onRefresh={onRefresh} />
          </div>
        )}
      </div>
    </div>
  )
}

function MetaItem({ label, value }) {
  return (
    <div className="rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 py-2.5">
      <div className="text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]">{label.toUpperCase()}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--figma-text-strong)]">{value}</div>
    </div>
  )
}

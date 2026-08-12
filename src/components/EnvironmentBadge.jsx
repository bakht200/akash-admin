import { AlertTriangle } from 'lucide-react'
import {
  APP_ENV,
  ENV_LABEL,
  IS_PRODUCTION,
  environmentSummary,
  environmentWarnings,
} from '../lib/environment'

const TONE = {
  production: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  staging: 'border-amber-300 bg-amber-50 text-amber-800',
  local: 'border-sky-200 bg-sky-50 text-sky-700',
  unknown: 'border-rose-300 bg-rose-50 text-rose-700',
}

/** Names the environment. Hover for the API host and Firebase project. */
export default function EnvironmentBadge({ className = '' }) {
  const warnings = environmentWarnings()
  const tone = warnings.length ? TONE.unknown : (TONE[APP_ENV] ?? TONE.unknown)

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${tone} ${className}`}
      title={warnings.length ? warnings.join('\n') : environmentSummary()}
    >
      {warnings.length ? <AlertTriangle className="h-3 w-3" aria-hidden="true" /> : null}
      <span>{warnings.length ? `${ENV_LABEL} — check config` : ENV_LABEL}</span>
    </div>
  )
}

/** Banner for a build whose settings contradict each other. Nothing when consistent. */
export function EnvironmentWarningBanner() {
  const warnings = environmentWarnings()
  if (!warnings.length) return null

  return (
    <div className="border-b border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-800">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="space-y-0.5">
          {warnings.map((w) => (
            <div key={w}>{w}</div>
          ))}
          {!IS_PRODUCTION ? <div className="font-normal">{environmentSummary()}</div> : null}
        </div>
      </div>
    </div>
  )
}

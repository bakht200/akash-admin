import { usePermissions } from '../hooks/usePermissions'
import { formatAdminDateTime } from '../lib/display'

export default function Settings() {
  const { user, permissions } = usePermissions()

  return (
    <div className="max-w-2xl rounded-2xl border border-[var(--figma-stroke)] bg-white p-5 shadow-sm sm:p-6">
      <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Account Settings</div>
      <div className="mt-1 text-xs text-[var(--figma-text-muted)]">
        Profile is managed via Google / Firebase admin auth. Role and permissions come from the server.
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ReadOnly label="Full name" value={user?.name || '—'} />
        <ReadOnly label="Role" value={user?.role || '—'} />
        <div className="sm:col-span-2">
          <ReadOnly label="Email" value={user?.email || '—'} />
        </div>
        <div className="sm:col-span-2">
          <div className="text-xs font-semibold text-[var(--figma-text-muted)]">PERMISSIONS</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(permissions.length ? permissions : ['—']).map((p) => (
              <span
                key={p}
                className="inline-flex rounded-[8px] bg-[var(--figma-input-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--figma-text)]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        {user?.lastLoginAt ? (
          <div className="sm:col-span-2">
            <ReadOnly label="Last login" value={formatAdminDateTime(user.lastLoginAt)} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ReadOnly({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold text-[var(--figma-text-muted)]">{label.toUpperCase()}</div>
      <div className="mt-1 rounded-xl border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-3 py-2.5 text-sm font-medium text-[var(--figma-text-strong)]">
        {value}
      </div>
    </div>
  )
}

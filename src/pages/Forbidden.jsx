import { Link } from 'react-router-dom'

export default function Forbidden() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold text-[var(--figma-text-strong)]">Permission denied</h1>
      <p className="mt-2 max-w-md text-sm text-[var(--figma-text-muted)]">
        You do not have access to this page. Contact a super admin if you believe this is an error.
      </p>
      <Link to="/dashboard" className="mt-6 text-sm font-semibold text-[var(--figma-brand)] hover:underline">
        Back to dashboard
      </Link>
    </div>
  )
}

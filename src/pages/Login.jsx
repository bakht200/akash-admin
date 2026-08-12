import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAuthed, signInWithGoogle } from '../auth/auth'
import AppLogo from '../components/AppLogo'
import EnvironmentBadge from '../components/EnvironmentBadge'
import { getErrorMessage } from '../lib/errors'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthed()) {
      const to = location.state?.from || '/dashboard'
      navigate(to, { replace: true })
    }
  }, [navigate, location.state])

  async function onGoogleSignIn() {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      const to = location.state?.from || '/dashboard'
      navigate(to, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Sign-in failed. You must be an authorized admin.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh bg-[var(--figma-app-bg)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[620px] w-[512px] rounded-[256px] bg-[var(--figma-brand-weak)] blur-[32px]" />
        <div className="absolute -left-24 bottom-[-220px] h-[518px] w-[384px] rounded-[192px] bg-[rgba(227,226,224,0.3)] blur-[32px]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[540px] items-center justify-center p-4 sm:p-6">
        <div className="app-canvas w-full max-w-[480px] px-4 py-6 sm:max-w-[500px] sm:px-6 sm:py-8">
          <div className="mx-auto flex w-full max-w-[440px] flex-col items-center">
            <div className="mb-5 flex flex-col items-center text-center leading-none">
              <AppLogo className="mx-auto h-28 w-auto max-w-[min(100%,440px)] object-contain object-center sm:h-32 md:h-36" />
              <EnvironmentBadge className="mt-3" />
              <div className="mt-1 text-[12px] leading-snug text-[var(--figma-text-muted)]">
                Practitioner Marketplace Portal
              </div>
            </div>

            <div className="figma-card w-full px-6 py-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h1 className="text-lg font-semibold text-[var(--figma-text-strong)]">Admin sign-in</h1>
                  <p className="mt-1 text-sm text-[var(--figma-text-muted)]">
                    Sign in with the Google account that was invited as an admin.
                  </p>
                </div>

                {error ? (
                  <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="button"
                  disabled={loading}
                  onClick={onGoogleSignIn}
                  className="btn-figma-primary mt-2 flex w-full items-center justify-center gap-3 text-sm font-semibold disabled:opacity-60"
                >
                  <GoogleIcon />
                  {loading ? 'Signing in…' : 'Continue with Google'}
                </button>

                <div className="pt-3 text-center text-xs text-[var(--figma-text-muted)]">
                  Need access? Contact a Super Admin to invite your email.
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-5 text-xs text-[var(--figma-text-muted)]">
              <Link className="hover:text-[var(--figma-text)] hover:underline" to="/login">
                PRIVACY POLICY
              </Link>
              <Link className="hover:text-[var(--figma-text)] hover:underline" to="/login">
                TERMS OF SERVICE
              </Link>
              <Link className="hover:text-[var(--figma-text)] hover:underline" to="/login">
                SUPPORT
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.3 4 24 4 16.1 4 9.2 8.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.1 39.5 16 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l.1.1 6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.5-.4-3.5z"
      />
    </svg>
  )
}

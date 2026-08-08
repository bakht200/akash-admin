import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  isAuthed,
  loginWithProvider,
  isFirebaseConfigured,
  isAppleSignInEnabled,
} from '../auth/auth'
import AppLogo from '../components/AppLogo'
import EnvironmentBadge from '../components/EnvironmentBadge'

/** Turn a sign-in failure into something that says what to do about it. */
function describeError(error) {
  const code = error?.code
  const status = error?.response?.status
  const serverMessage = error?.response?.data?.error?.message

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Sign-in was cancelled.'
  }
  if (code === 'auth/popup-blocked') {
    return 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.'
  }
  if (code === 'auth/operation-not-allowed') {
    return 'That sign-in method is not enabled for this project yet.'
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This site is not an authorised domain for the Firebase project.'
  }
  if (status === 403) {
    return serverMessage ?? 'This account is not authorised for admin access.'
  }
  if (status === 400) {
    return serverMessage ?? 'Sign-in token was rejected. Check that the dashboard and the API use the same Firebase project.'
  }
  if (error?.message?.includes('Network Error') || code === 'ERR_NETWORK') {
    return 'Could not reach the API. Check the API address for this environment and its allowed origins.'
  }
  return serverMessage ?? error?.message ?? 'Sign-in failed.'
}

export default function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  useEffect(() => {
    if (isAuthed()) navigate('/dashboard', { replace: true })
  }, [navigate])

  async function signIn(providerId) {
    setError('')
    setBusy(providerId)
    try {
      await loginWithProvider(providerId)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="relative min-h-dvh bg-[var(--figma-app-bg)]">
      {/* Decorative background blobs from SVG */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[620px] w-[512px] rounded-[256px] bg-[var(--figma-brand-weak)] blur-[32px]" />
        <div className="absolute -left-24 bottom-[-220px] h-[518px] w-[384px] rounded-[192px] bg-[rgba(227,226,224,0.3)] blur-[32px]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[540px] items-center justify-center p-4 sm:p-6">
        {/* Main white canvas — narrow card aligned with form column */}
        <div className="app-canvas w-full max-w-[480px] px-4 py-6 sm:max-w-[500px] sm:px-6 sm:py-8">
          <div className="mx-auto flex w-full max-w-[440px] flex-col items-center">
            <div className="mb-5 flex flex-col items-center text-center leading-none">
              <AppLogo className="mx-auto h-28 w-auto max-w-[min(100%,440px)] object-contain object-center sm:h-32 md:h-36" />
              <div className="mt-1 text-[12px] leading-snug text-[var(--figma-text-muted)]">
                Practitioner Marketplace Portal
              </div>
              {/* Staging and production are otherwise identical on screen. */}
              <EnvironmentBadge className="mt-3" />
            </div>

            {/* Login card */}
            <div className="figma-card w-full px-6 py-6">
              <div className="text-center">
                <div className="text-sm font-semibold text-[var(--figma-text-strong)]">
                  Sign in to continue
                </div>
                <div className="mt-1 text-xs text-[var(--figma-text-muted)]">
                  Access is limited to registered admin accounts.
                </div>
              </div>

              {!isFirebaseConfigured ? (
                <div className="mt-5 rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                  Sign-in is not configured for this build. The VITE_FIREBASE_* values are
                  missing.
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={() => signIn('google')}
                    disabled={Boolean(busy)}
                    className="btn-figma-primary flex w-full items-center justify-center gap-2 text-sm font-semibold disabled:opacity-60"
                  >
                    <GoogleMark />
                    {busy === 'google' ? 'Signing in…' : 'Continue with Google'}
                  </button>

                  {isAppleSignInEnabled ? (
                    <button
                      type="button"
                      onClick={() => signIn('apple')}
                      disabled={Boolean(busy)}
                      className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--figma-text-strong)] hover:bg-[var(--figma-input-bg)] disabled:opacity-60"
                    >
                      <AppleMark />
                      {busy === 'apple' ? 'Signing in…' : 'Continue with Apple'}
                    </button>
                  ) : null}
                </div>
              )}

              {error ? (
                <div className="mt-4 rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="pt-4 text-center text-xs text-[var(--figma-text-muted)]">
                Need access to the Akash Admin Portal? Ask a super admin to add your
                address.
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

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3A12 12 0 1 1 24 12c3 0 5.8 1.2 7.9 3.1l5.7-5.7A20 20 0 1 0 44 24c0-1.3-.1-2.6-.4-3.9z"
        transform="scale(.5)"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.2 7.9 3.1l5.7-5.7A20 20 0 0 0 6.3 14.7z"
        transform="scale(.5)"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.6 5.1A20 20 0 0 0 24 44z"
        transform="scale(.5)"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C41 35.3 44 30.1 44 24c0-1.3-.1-2.6-.4-3.9z"
        transform="scale(.5)"
      />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.8c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7 1.4 0 1.8.7 3 .7 1.2 0 2.1-1.2 2.9-2.3.6-.9.9-1.4 1.3-2.4-2.3-.9-2.8-3.2-2.8-4.1zM14.3 5.6c.6-.8 1-1.8.9-2.9-1 0-2.2.7-2.8 1.5-.6.7-1.1 1.7-.9 2.8 1.1 0 2.2-.6 2.8-1.4z" />
    </svg>
  )
}

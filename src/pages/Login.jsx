import { Lock, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { isAuthed, setAuthed } from '../auth/auth'
import AppLogo from '../components/AppLogo'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthed()) navigate('/dashboard', { replace: true })
  }, [navigate])

  function onSubmit(e) {
    e.preventDefault()
    setError('')

    const ok =
      email.trim().toLowerCase() === 'akash@gmail.com' && password === '123456'

    if (!ok) {
      setAuthed(false)
      setError('Invalid email or password.')
      return
    }

    setAuthed(true)
    navigate('/dashboard', { replace: true })
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
            </div>

            {/* Login card */}
            <div className="figma-card w-full px-6 py-6">
              <form className="space-y-4" onSubmit={onSubmit}>
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-[var(--figma-text-muted)]">EMAIL ADDRESS</div>
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--figma-text-muted)]/70" />
                    <input
                      className="figma-input w-full pl-11 pr-4 text-sm text-[var(--figma-text)] placeholder:text-[var(--figma-text-muted)]/60"
                      placeholder="akash@gmail.com"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold tracking-wide text-[var(--figma-text-muted)]">PASSWORD</div>
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-[var(--figma-text-strong)] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--figma-text-muted)]/70" />
                    <input
                      className="figma-input w-full pl-11 pr-4 text-sm text-[var(--figma-text)] placeholder:text-[var(--figma-text-muted)]/60"
                      placeholder="••••••••••"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                    {error}
                  </div>
                ) : null}

                <button type="submit" className="btn-figma-primary mt-2 w-full text-sm font-semibold">
                  Log Into Dashboard
                </button>

                <div className="pt-3 text-center text-xs text-[var(--figma-text-muted)]">
                  Need access to the Akash Admin Portal?{' '}
                  <button type="button" className="font-semibold text-[var(--figma-text-strong)] hover:underline">
                    Contact System Admin
                  </button>
                </div>
              </form>
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


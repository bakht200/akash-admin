import { Bell, CircleHelp, Download, Menu, Plus, RefreshCw, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ title, subtitle, onOpenSidebar, actions, searchPlaceholder = 'SEARCH RECORDS...' }) {
  const navigate = useNavigate()
  const secondary = actions?.secondary
  const primary = actions?.primary
  const hasHeading = Boolean(title) || Boolean(subtitle)
  const hasRow2 = hasHeading || Boolean(secondary) || Boolean(primary)

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--figma-stroke)] bg-white/90 backdrop-blur">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        {/* Row 1: search + tabs + icons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text)] lg:hidden"
            onClick={onOpenSidebar}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative w-full min-w-0 flex-1 sm:max-w-md lg:max-w-xl xl:max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--figma-text)]" />
            <input
              placeholder={searchPlaceholder}
              className="h-[35px] w-full rounded border border-transparent bg-white pl-11 pr-4 text-[12px] font-medium tracking-wide text-[var(--figma-text)] placeholder:font-medium placeholder:tracking-wide placeholder:text-[rgba(71,69,81,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.14)]"
            />
          </div>

          <div className="hidden flex-1 items-center lg:ml-4 lg:flex lg:justify-start">
            <span className="relative text-xs font-semibold tracking-wide text-[var(--figma-text-strong)]">
                 <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-[var(--figma-brand)]" />
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text)] hover:bg-[rgba(244,243,241,0.7)]"
              aria-label="Notifications"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text)] hover:bg-[rgba(244,243,241,0.7)]"
              aria-label="Help"
            >
              <CircleHelp className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Row 2: title + actions */}
        {hasRow2 ? (
          <div
            className={[
              'mt-6 flex items-start gap-4',
              hasHeading ? 'justify-between' : 'justify-end',
            ].join(' ')}
          >
            {hasHeading ? (
              <div className="min-w-0">
                {title ? (
                  <div className="truncate text-lg font-semibold text-[var(--figma-text-strong)] sm:text-xl">{title}</div>
                ) : null}
                {subtitle ? (
                  <div className="mt-0.5 line-clamp-1 text-sm text-[var(--figma-text-muted)]">{subtitle}</div>
                ) : null}
              </div>
            ) : null}

            <div className="hidden items-center gap-2 sm:flex">
              {secondary ? (
                <button
                  type="button"
                  onClick={secondary.onClick}
                  className={[
                    'inline-flex h-10 items-center justify-center gap-2 rounded-[8px] px-4 text-[11px] font-semibold tracking-[0.14em]',
                    secondary.variant === 'outline'
                      ? 'border border-[var(--figma-brand)] bg-white text-[var(--figma-brand)] hover:bg-[rgba(27,20,100,0.04)]'
                      : 'bg-[#E3E2E0] text-[#1A1C1B] hover:brightness-[0.98]',
                  ].join(' ')}
                >
                  {secondary.icon === 'download' ? <Download className="h-4 w-4" /> : null}
                  {secondary.label}
                </button>
              ) : null}
              {primary ? (
                <button
                  type="button"
                  onClick={primary.onClick}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[var(--figma-brand)] px-4 text-[11px] font-semibold tracking-[0.14em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:brightness-[0.98]"
                >
                  {primary.icon === 'plus' ? <Plus className="h-4 w-4" /> : null}
                  {primary.icon === 'refresh' ? <RefreshCw className="h-4 w-4" /> : null}
                  {primary.label}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {secondary || primary ? (
          <div className="mt-3 flex items-center gap-2 sm:hidden">
            {secondary ? (
              <button
                type="button"
                onClick={secondary.onClick}
                className={[
                  'flex-1 rounded-[8px] px-4 py-2 text-[11px] font-semibold tracking-[0.14em]',
                  secondary.variant === 'outline'
                    ? 'border border-[var(--figma-brand)] bg-white text-[var(--figma-brand)]'
                    : 'bg-[#E3E2E0] text-[#1A1C1B]',
                ].join(' ')}
              >
                {secondary.label}
              </button>
            ) : null}
            {primary ? (
              <button
                type="button"
                onClick={primary.onClick}
                className="flex-1 rounded-[8px] bg-[var(--figma-brand)] px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-white"
              >
                {primary.label}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  )
}


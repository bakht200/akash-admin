import { Bell, CircleHelp, Download, Menu, Plus, RefreshCw, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Topbar({
  title,
  subtitle,
  onOpenSidebar,
  actions,
  searchPlaceholder = 'SEARCH RECORDS...',
  showSearch = true,
}) {
  const navigate = useNavigate()
  const secondary = actions?.secondary
  const primary = actions?.primary
  const hasHeading = Boolean(title) || Boolean(subtitle)

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--figma-stroke)] bg-white/90 backdrop-blur">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text)] lg:hidden"
            onClick={onOpenSidebar}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {showSearch ? (
            <div className="relative min-w-0 flex-1 sm:max-w-md lg:max-w-xl xl:max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--figma-text)]" />
              <input
                placeholder={searchPlaceholder}
                className="h-[35px] w-full rounded border border-transparent bg-white pl-11 pr-4 text-[12px] font-medium tracking-wide text-[var(--figma-text)] placeholder:font-medium placeholder:tracking-wide placeholder:text-[rgba(71,69,81,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.14)]"
              />
            </div>
          ) : hasHeading ? (
            <div className="min-w-0 flex-1">
              {title ? (
                <div className="truncate text-lg font-semibold text-[var(--figma-text-strong)] sm:text-xl">{title}</div>
              ) : null}
              {subtitle ? (
                <div className="mt-0.5 line-clamp-1 text-sm text-[var(--figma-text-muted)]">{subtitle}</div>
              ) : null}
            </div>
          ) : (
            <div className="min-w-0 flex-1" />
          )}

          {/* When search is shown, put title after it on larger screens */}
          {showSearch && hasHeading ? (
            <div className="hidden min-w-0 flex-1 lg:block">
              {title ? (
                <div className="truncate text-base font-semibold text-[var(--figma-text-strong)]">{title}</div>
              ) : null}
              {subtitle ? (
                <div className="mt-0.5 line-clamp-1 text-xs text-[var(--figma-text-muted)]">{subtitle}</div>
              ) : null}
            </div>
          ) : null}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {secondary ? (
              <button
                type="button"
                onClick={secondary.onClick}
                disabled={secondary.disabled}
                className={[
                  'hidden h-10 items-center justify-center gap-2 rounded-[8px] px-4 text-[11px] font-semibold tracking-[0.14em] disabled:opacity-60 sm:inline-flex',
                  secondary.variant === 'outline'
                    ? 'border border-[var(--figma-stroke)] bg-white text-[var(--figma-text-strong)] hover:bg-[rgba(244,243,241,0.7)]'
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
                disabled={primary.disabled}
                className="hidden h-10 items-center justify-center gap-2 rounded-[8px] bg-[var(--figma-brand)] px-4 text-[11px] font-semibold tracking-[0.14em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:brightness-[0.98] disabled:opacity-60 sm:inline-flex"
              >
                {primary.icon === 'download' ? <Download className="h-4 w-4" /> : null}
                {primary.icon === 'plus' ? <Plus className="h-4 w-4" /> : null}
                {primary.icon === 'refresh' ? <RefreshCw className="h-4 w-4" /> : null}
                {primary.label}
              </button>
            ) : null}

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

        {/* Mobile: title under search when search is present */}
        {showSearch && hasHeading ? (
          <div className="mt-3 min-w-0 lg:hidden">
            {title ? (
              <div className="truncate text-lg font-semibold text-[var(--figma-text-strong)]">{title}</div>
            ) : null}
            {subtitle ? (
              <div className="mt-0.5 line-clamp-2 text-sm text-[var(--figma-text-muted)]">{subtitle}</div>
            ) : null}
          </div>
        ) : null}

        {/* Mobile action buttons */}
        {secondary || primary ? (
          <div className="mt-3 flex items-center gap-2 sm:hidden">
            {secondary ? (
              <button
                type="button"
                onClick={secondary.onClick}
                disabled={secondary.disabled}
                className={[
                  'flex-1 rounded-[8px] px-4 py-2 text-[11px] font-semibold tracking-[0.14em] disabled:opacity-60',
                  secondary.variant === 'outline'
                    ? 'border border-[var(--figma-stroke)] bg-white text-[var(--figma-text-strong)]'
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
                disabled={primary.disabled}
                className="flex-1 rounded-[8px] bg-[var(--figma-brand)] px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-white disabled:opacity-60"
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

import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, total, limit, onPageChange, label = 'results' }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const pages = pageWindow(page, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs font-medium text-[var(--figma-text-muted)]">
        SHOWING {from} TO {to} OF {total.toLocaleString()} {label.toUpperCase()}.
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="grid h-9 w-9 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text)] disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((n, idx) =>
          n === '…' ? (
            <span key={`e-${idx}`} className="px-1 text-sm text-[var(--figma-text-muted)]">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPageChange(n)}
              className={[
                'flex h-9 min-w-[36px] items-center justify-center rounded-[8px] px-2 text-sm font-semibold',
                page === n
                  ? 'bg-[var(--figma-brand)] text-white'
                  : 'border border-transparent text-[var(--figma-text)] hover:bg-[var(--figma-input-bg)]',
              ].join(' ')}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="grid h-9 w-9 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text)] disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function pageWindow(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const set = new Set([1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages))
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…')
    out.push(sorted[i])
  }
  return out
}

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Paperclip } from 'lucide-react'
import { usePaginatedList } from '../hooks/usePaginatedList'
import { fetchSupportTickets } from '../services/support'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import EmptyState from '../components/states/EmptyState'
import Pagination from '../components/Pagination'
import { formatAdminDateTime, personName } from '../lib/display'
import { getErrorMessage } from '../lib/errors'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

function ticketStatusClass(status) {
  const key = String(status || '').toLowerCase()
  if (key === 'open') return 'bg-sky-100 text-sky-800'
  if (key === 'in_progress') return 'bg-amber-100 text-amber-900'
  if (key === 'resolved') return 'bg-emerald-100 text-emerald-800'
  if (key === 'closed') return 'bg-slate-100 text-slate-700'
  return 'bg-slate-100 text-slate-700'
}

export default function SupportTickets() {
  const navigate = useNavigate()
  const [qInput, setQInput] = useState('')
  const fetcher = useCallback((params) => fetchSupportTickets(params), [])
  const list = usePaginatedList(fetcher, {
    limit: 25,
    initialFilters: { status: 'all', source: 'all', q: '' },
  })

  useEffect(() => {
    const t = setTimeout(() => list.setFilters({ q: qInput.trim() }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce search only
  }, [qInput])

  return (
    <div className="space-y-6">
      <section className="figma-card overflow-hidden">
        <div className="border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              className="h-11 min-w-0 flex-1 rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-4 text-sm text-[var(--figma-text)] placeholder:text-[var(--figma-text-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]"
              placeholder="Search subject, message, or user…"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
            />
            <select
              value={list.filters.status || 'all'}
              onChange={(e) => list.setFilters({ status: e.target.value })}
              className="h-11 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={list.filters.source || 'all'}
              onChange={(e) => list.setFilters({ source: e.target.value })}
              className="h-11 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)]"
            >
              <option value="all">All types</option>
              <option value="identity_verification">Identity follow-up</option>
            </select>
          </div>
        </div>

        {list.loading ? (
          <LoadingState label="Loading support tickets…" />
        ) : list.error ? (
          <ErrorState message={getErrorMessage(list.error, 'Could not load support tickets.')} onRetry={list.reload} />
        ) : list.items.length === 0 ? (
          <EmptyState title="No support tickets" description="New user requests and identity follow-ups will show up here." />
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="min-w-[920px] w-full border-collapse">
              <thead>
                <tr className="border-y border-[var(--figma-stroke)] bg-white">
                  {['User', 'Subject', 'Replies', 'Updated', 'Status', 'Actions'].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)] sm:px-6"
                    >
                      {heading.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.items.map((ticket) => {
                  const name = personName(ticket.user) || ticket.user?.email || 'User'
                  return (
                    <tr
                      key={ticket.id}
                      className="cursor-pointer border-b border-[var(--figma-stroke)] last:border-b-0 hover:bg-[rgba(244,243,241,0.55)]"
                      tabIndex={0}
                      onClick={() => navigate(`/support-tickets/${ticket.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/support-tickets/${ticket.id}`)
                        }
                      }}
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{name}</div>
                        <div className="text-xs capitalize text-[var(--figma-text-muted)]">
                          {ticket.user?.role || 'user'}
                          {ticket.source === 'identity_verification' ? ' · Identity' : ''}
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--figma-text-strong)]">{ticket.subject}</span>
                          {ticket.hasAttachment ? (
                            <Paperclip className="h-3.5 w-3.5 shrink-0 text-[var(--figma-text-muted)]" />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                        {ticket.replyCount ?? 0}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                        {formatAdminDateTime(ticket.updatedAt || ticket.lastReplyAt || ticket.createdAt)}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span
                          className={[
                            'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold capitalize',
                            ticketStatusClass(ticket.status),
                          ].join(' ')}
                        >
                          {String(ticket.status || 'open').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)]"
                          aria-label={`Open ticket for ${name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/support-tickets/${ticket.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          limit={list.limit}
          onPageChange={list.setPage}
          label="tickets"
        />
      </section>
    </div>
  )
}

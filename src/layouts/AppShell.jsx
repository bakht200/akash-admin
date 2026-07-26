import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const PAGE_META = [
  {
    path: '/dashboard',
    title: 'Executive Ledger',
    subtitle: 'Track key performance metrics and practitioner earnings.',
    actions: {
      secondary: { label: 'Download Report', icon: 'download' },
    },
  },
  {
    path: '/practitioners',
    title: 'Practitioners',
    subtitle: 'Monitor and manage all practitioners in the Akash network.',
    actions: {
      secondary: { label: 'Export CSV', icon: 'download' },
    },
  },
  {
    path: '/practitioners/:id',
    title: '',
    subtitle: '',
    actions: null,
  },
  {
    path: '/clients',
    title: 'Clients',
    subtitle: 'Manage and monitor client engagement across the platform.',
    actions: {
      secondary: { label: 'Export CSV', icon: 'download' },
    },
  },
  {
    path: '/clients/:id',
    title: '',
    subtitle: '',
    actions: null,
  },
  {
    path: '/sessions',
    title: 'Sessions',
    subtitle: 'Monitor and manage all practitioner-client interactions.',
    actions: {
      secondary: { label: 'Export CSV', icon: 'download', variant: 'outline' },
    },
  },
  {
    path: '/sessions/:id',
    title: '',
    subtitle: '',
    actions: null,
  },
  {
    path: '/modalities',
    title: 'Modalities Management',
    subtitle: 'Govern disciplines, demand cycles, and practitioner density.',
    actions: {
      primary: { label: 'Add New Modality', icon: 'plus' },
    },
  },
  {
    path: '/revenue',
    title: '',
    subtitle: '',
    actions: null,
  },
  {
    path: '/transactions',
    title: 'Financial Ledger',
    subtitle: 'Individual transactions, payouts, refunds, and settlement status.',
    actions: {
      secondary: { label: 'Export CSV', icon: 'download', variant: 'outline' },
    },
  },
  {
    path: '/payouts',
    title: 'Payouts',
    subtitle: 'Manage and reconcile practitioner distributions.',
    actions: {
      secondary: { label: 'Export CSV', icon: 'download' },
    },
  },
  {
    path: '/wallet',
    title: 'Wallet Overview',
    subtitle: 'Platform Stripe liquidity and balance movements.',
    actions: null,
  },
  {
    path: '/reviews',
    title: 'Review Management',
    subtitle: 'Moderate ratings, resolve flags, and enforce publication policy.',
    actions: {
      secondary: { label: 'Export CSV', icon: 'download' },
    },
  },
  {
    path: '/notifications',
    title: 'Notification Logs',
    subtitle: 'Monitor Email and Push delivery for all user activities.',
    actions: {
      secondary: { label: 'Export Logs', icon: 'download', variant: 'outline' },
      primary: { label: 'Live Refresh', icon: 'refresh' },
    },
  },
  { path: '/settings', title: 'Settings', subtitle: 'Update your account preferences.' },
]

const HIDE_SEARCH_PATHS = new Set(['/dashboard', '/revenue', '/wallet'])

function getSearchPlaceholder(pathname) {
  if (pathname === '/practitioners' || /^\/practitioners\/[^/]+$/.test(pathname)) {
    return 'Search practitioners…'
  }
  if (pathname === '/sessions' || /^\/sessions\/[^/]+$/.test(pathname)) {
    return 'Search sessions…'
  }
  if (pathname === '/clients' || /^\/clients\/[^/]+$/.test(pathname)) {
    return 'Search clients…'
  }
  if (pathname === '/modalities') return 'Search modalities…'
  if (pathname === '/notifications') return 'Search notification records…'
  if (pathname === '/transactions') return 'Search transactions…'
  if (pathname === '/payouts') return 'Search payouts…'
  if (pathname === '/reviews') return 'Search reviews…'
  return 'Search records…'
}

export default function AppShell() {
  const location = useLocation()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const meta = useMemo(() => {
    const pathname = location.pathname
    const direct = PAGE_META.find((m) => m.path === pathname)
    if (direct) return direct

    if (/^\/clients\/[^/]+$/.test(pathname) && pathname !== '/clients') {
      return PAGE_META.find((m) => m.path === '/clients/:id') ?? { title: '', subtitle: '', actions: null }
    }

    if (/^\/sessions\/[^/]+$/.test(pathname) && pathname !== '/sessions') {
      return PAGE_META.find((m) => m.path === '/sessions/:id') ?? { title: '', subtitle: '', actions: null }
    }

    if (pathname.startsWith('/practitioners/')) {
      return PAGE_META.find((m) => m.path === '/practitioners/:id') ?? { title: 'My Portal', subtitle: '' }
    }

    return { title: 'My Portal', subtitle: '' }
  }, [location.pathname])

  const showSearch = !HIDE_SEARCH_PATHS.has(location.pathname)
  const searchPlaceholder = getSearchPlaceholder(location.pathname)

  return (
    <div className="min-h-dvh bg-[var(--figma-app-bg)] text-[var(--figma-text)]">
      <div className="min-h-dvh w-full max-w-none p-3 sm:p-4 lg:p-6">
        <div className="app-canvas flex min-h-[calc(100dvh-32px)] overflow-hidden sm:min-h-[calc(100dvh-48px)]">
          <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />

          <div className="flex min-w-0 flex-1 flex-col bg-white">
            <Topbar
              title={meta.title}
              subtitle={meta.subtitle}
              actions={meta.actions}
              searchPlaceholder={searchPlaceholder}
              showSearch={showSearch}
              onOpenSidebar={() => setMobileSidebarOpen(true)}
            />

            <main className="min-w-0 flex-1 bg-[var(--figma-app-bg)] px-4 pb-8 pt-6 sm:px-6 lg:px-8">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

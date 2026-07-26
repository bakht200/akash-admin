import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth'
import FinancialRoute from './auth/FinancialRoute'
import PermissionRoute from './auth/PermissionRoute'
import AppShell from './layouts/AppShell'
import Login from './pages/Login'
import Forbidden from './pages/Forbidden'
import Dashboard from './pages/Dashboard'
import Practitioners from './pages/Practitioners'
import PractitionerDetail from './pages/PractitionerDetail'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Modalities from './pages/Modalities'
import Sessions from './pages/Sessions'
import SessionDetail from './pages/SessionDetail'
import Revenue from './pages/Revenue'
import Transactions from './pages/Transactions'
import Payouts from './pages/Payouts'
import Wallet from './pages/Wallet'
import Reviews from './pages/Reviews'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import PromoCodes from './pages/PromoCodes'

// Vite's BASE_URL keeps a trailing slash; React Router expects it without one.
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forbidden" element={<Forbidden />} />

            <Route element={<PermissionRoute permission="practitioners:read" />}>
              <Route path="/practitioners" element={<Practitioners />} />
              <Route path="/practitioners/:id" element={<PractitionerDetail />} />
            </Route>

            <Route element={<PermissionRoute permission="clients:read" />}>
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
            </Route>

            <Route element={<PermissionRoute permission="sessions:read" />}>
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/sessions/:id" element={<SessionDetail />} />
            </Route>

            <Route element={<PermissionRoute permission="settings:read" />}>
              <Route path="/promo-codes" element={<PromoCodes />} />
            </Route>

            <Route element={<PermissionRoute permission="modalities:read" />}>
              <Route path="/modalities" element={<Modalities />} />
            </Route>
            <Route element={<FinancialRoute />}>
              <Route path="/revenue" element={<Revenue />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/payouts" element={<Payouts />} />
              <Route path="/wallet" element={<Wallet />} />
            </Route>
            <Route element={<PermissionRoute permission="reviews:read" />}>
              <Route path="/reviews" element={<Reviews />} />
            </Route>
            <Route element={<PermissionRoute permission="notifications:read" />}>
              <Route path="/notifications" element={<Notifications />} />
            </Route>
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

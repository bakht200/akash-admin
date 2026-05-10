import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth'
import AppShell from './layouts/AppShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Practitioners from './pages/Practitioners'
import PractitionerDetail from './pages/PractitionerDetail'
import PractitionerVerification from './pages/PractitionerVerification'
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
import Users from './pages/Users'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/practitioners" element={<Practitioners />} />
            <Route path="/practitioners/:id/verification" element={<PractitionerVerification />} />
            <Route path="/practitioners/:id" element={<PractitionerDetail />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/modalities" element={<Modalities />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/payouts" element={<Payouts />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
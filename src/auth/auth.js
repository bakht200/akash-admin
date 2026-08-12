import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { apiPost, apiGet } from '../api/client'
import { applyAuthSession, clearSession, getRefreshToken, getAccessToken } from './session'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
}

function assertFirebaseConfigured() {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase is not configured. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_PROJECT_ID.',
    )
  }
}

function getFirebaseAuth() {
  assertFirebaseConfigured()
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  return getAuth(app)
}

function deviceInfo() {
  if (typeof navigator === 'undefined') return 'Admin Dashboard'
  const ua = navigator.userAgent
  const platform = navigator.platform || 'unknown'
  return `${ua.slice(0, 80)} / ${platform}`
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth()
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const result = await signInWithPopup(auth, provider)
  const idToken = await result.user.getIdToken()
  const data = await apiPost('/admin/auth/oauth', {
    idToken,
    deviceInfo: deviceInfo(),
  })
  applyAuthSession(data)
  return data
}

export async function fetchMe() {
  const data = await apiGet('/admin/auth/me')
  const admin = data?.admin ?? data
  applyAuthSession({ admin })
  return admin
}

export async function logout() {
  const refreshToken = getRefreshToken()
  try {
    if (getAccessToken() && refreshToken) {
      await apiPost('/admin/auth/logout', { refreshToken })
    }
  } catch {
    // Always clear local session even if the server call fails
  }
  clearSession()
  try {
    const auth = getFirebaseAuth()
    await signOut(auth)
  } catch {
    // Firebase may be unconfigured during local teardown
  }
}

export {
  isAuthed,
  getCurrentUser,
  getPermissions,
  getAccessToken,
  clearSession,
} from './session'

export function setAuthed(value) {
  if (!value) clearSession()
}

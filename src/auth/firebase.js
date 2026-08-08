import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
}

/**
 * True when every value the sign-in flow needs is present. Checked so a build made
 * without an env file shows "sign-in is not configured" rather than throwing an
 * opaque Firebase internal error at the user.
 */
export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
)

let authInstance = null

function getAuthInstance() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Set the VITE_FIREBASE_* variables for this environment.',
    )
  }
  if (!authInstance) {
    authInstance = getAuth(initializeApp(config))
  }
  return authInstance
}

/**
 * Whether to offer Apple sign-in.
 *
 * The API accepts Apple already — it maps apple.com to its apple provider — but the
 * popup fails with auth/operation-not-allowed until Apple is enabled in the Firebase
 * project, which also requires a Services ID and a Sign in with Apple key on the Apple
 * Developer side. Gated on a flag so the button appears only once that exists, rather
 * than offering a choice that always errors.
 */
export const isAppleSignInEnabled = import.meta.env.VITE_ENABLE_APPLE_SIGNIN === 'true'

/**
 * Open the provider's sign-in popup and return the Firebase ID token.
 *
 * The token proves who the person is; it grants nothing on its own. The backend
 * exchanges it for an admin session only when the email exists in admin_users, so
 * authorization lives there rather than here.
 */
export async function signInWithProvider(providerId = 'google') {
  let provider
  if (providerId === 'apple') {
    provider = new OAuthProvider('apple.com')
    // Apple returns an email only when these are requested.
    provider.addScope('email')
    provider.addScope('name')
  } else {
    provider = new GoogleAuthProvider()
    // Always show the chooser. Without this, a browser signed into one Google account
    // silently reuses it, which is the wrong default on a shared admin machine.
    provider.setCustomParameters({ prompt: 'select_account' })
  }

  const credential = await signInWithPopup(getAuthInstance(), provider)
  return credential.user.getIdToken()
}

/** Kept as the common case; delegates to signInWithProvider. */
export async function signInWithGoogle() {
  return signInWithProvider('google')
}

/**
 * Drop the Firebase session. Separate from clearing our own session: leaving the
 * Firebase one behind means the next sign-in silently reuses the same account.
 */
export async function signOutOfFirebase() {
  if (!isFirebaseConfigured) return
  try {
    await firebaseSignOut(getAuthInstance())
  } catch {
    // Logout must complete locally even if this fails.
  }
}

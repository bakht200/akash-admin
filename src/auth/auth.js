import {
  isAuthed,
  clearSession,
  mockLogin,
  getCurrentUser,
  getPermissions,
  getAccessToken,
} from './session'

export { isAuthed, mockLogin, getCurrentUser, getPermissions, getAccessToken }

export function setAuthed(value) {
  if (!value) clearSession()
}

const STORAGE_KEY = 'my-portal:isAuthed'

export function isAuthed() {
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

export function setAuthed(value) {
  window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false')
}


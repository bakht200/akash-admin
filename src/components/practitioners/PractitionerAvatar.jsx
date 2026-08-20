import { useState } from 'react'

export default function PractitionerAvatar({ name, avatarUrl, className = 'h-20 w-20 text-xl' }) {
  const [imgFailed, setImgFailed] = useState(false)
  const initials = String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  const showImage = avatarUrl && !imgFailed

  return (
    <div
      className={[
        'relative shrink-0 overflow-hidden rounded-full bg-[var(--figma-input-bg)] ring-4 ring-white shadow-[0_4px_14px_rgba(27,20,100,0.12)]',
        className,
      ].join(' ')}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center font-semibold text-[var(--figma-brand)]">
          {initials || '—'}
        </div>
      )}
    </div>
  )
}

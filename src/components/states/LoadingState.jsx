export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-[12px] border border-[var(--figma-stroke)] bg-white p-8">
      <p className="text-sm font-medium text-[var(--figma-text-muted)]">{label}</p>
    </div>
  )
}

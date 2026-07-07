export default function EmptyState({ title = 'No results', description = 'Try adjusting your filters.' }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[12px] border border-dashed border-[var(--figma-stroke)] bg-white p-8 text-center">
      <p className="text-sm font-semibold text-[var(--figma-text-strong)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--figma-text-muted)]">{description}</p>
    </div>
  )
}

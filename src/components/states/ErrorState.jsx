export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[12px] border border-rose-200 bg-rose-50/50 p-8 text-center">
      <p className="text-sm font-semibold text-rose-800">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-[8px] bg-white px-4 py-2 text-sm font-semibold text-[var(--figma-brand)] ring-1 ring-[var(--figma-stroke)]"
        >
          Try again
        </button>
      ) : null}
    </div>
  )
}

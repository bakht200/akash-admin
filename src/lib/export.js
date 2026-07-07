/** Async export UX helper (FR-5) — polls until ready or returns sync blob. */
export async function runExport({ start, poll, label = 'Preparing your export…' }) {
  const job = await start()
  if (job.downloadUrl) {
    window.open(job.downloadUrl, '_blank', 'noopener')
    return job
  }
  if (job.blob) {
    const url = URL.createObjectURL(job.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = job.filename ?? 'export.csv'
    a.click()
    URL.revokeObjectURL(url)
    return job
  }
  if (!poll) return job

  let attempts = 0
  while (attempts < 60) {
    await new Promise((r) => setTimeout(r, 1500))
    const status = await poll(job.id)
    if (status.downloadUrl) {
      window.open(status.downloadUrl, '_blank', 'noopener')
      return status
    }
    if (status.ready && status.blob) {
      const url = URL.createObjectURL(status.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = status.filename ?? 'export.csv'
      a.click()
      URL.revokeObjectURL(url)
      return status
    }
    attempts += 1
  }
  throw new Error(label)
}

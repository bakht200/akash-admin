function Settings() {
  const profile = {
    name: 'Admin',
    role: 'Admin',
    email: 'akash@gmail.com',
  }

  return (
    <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="text-sm font-semibold text-slate-900">Account Settings</div>
      <div className="mt-1 text-xs text-slate-500">Update your profile details and preferences.</div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-slate-600">FULL NAME</label>
          <input
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2BFF]/25"
            defaultValue={profile.name}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">ROLE</label>
          <input
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2BFF]/25"
            defaultValue={profile.role}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-600">EMAIL</label>
          <input
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2BFF]/25"
            defaultValue={profile.email}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[#E3E2E0] px-4 text-[11px] font-semibold tracking-[0.14em] text-[#1A1C1B] hover:brightness-[0.98]"
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[var(--figma-brand)] px-4 text-[11px] font-semibold tracking-[0.14em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:brightness-[0.98]"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default Settings
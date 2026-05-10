function Users() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">All Users</div>
        <button
          type="button"
          className="rounded-xl bg-[#1B2BFF] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1624E0]"
        >
          + Add user
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="pb-3 font-semibold">Name</th>
              <th className="pb-3 font-semibold">Email</th>
              <th className="pb-3 font-semibold">Role</th>
              <th className="pb-3 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Ali Hassan', email: 'ali@email.com', role: 'Admin', status: 'Active' },
              { name: 'Sara Khan', email: 'sara@email.com', role: 'Editor', status: 'Pending' },
              { name: 'Usman Ali', email: 'usman@email.com', role: 'Viewer', status: 'Inactive' },
            ].map((u) => (
              <tr key={u.email} className="border-b border-slate-100 last:border-b-0">
                <td className="py-3 font-semibold text-slate-900">{u.name}</td>
                <td className="py-3 text-slate-600">{u.email}</td>
                <td className="py-3 text-slate-600">{u.role}</td>
                <td className="py-3 text-right">
                  <span
                    className={[
                      'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                      u.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : u.status === 'Pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700',
                    ].join(' ')}
                  >
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Users
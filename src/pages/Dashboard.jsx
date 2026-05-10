const stats = [
  { label: 'Total revenue', value: '$12,482', subtitle: 'Last 30 days', delta: '+12.4%', deltaTone: 'pos' },
  { label: 'Total transactions', value: '6,241', subtitle: 'Compared to last month', delta: '+4.8%', deltaTone: 'pos' },
  { label: 'Active users', value: '842', subtitle: 'Weekly active users', delta: '+1.2%', deltaTone: 'pos' },
  { label: 'Refund requests', value: '28', subtitle: 'Last 30 days', delta: '-0.9%', deltaTone: 'neg' },
]

const approvals = [
  { name: 'Dr. Emma Reed', specialization: 'Trauma-informed Therapy', time: '2h ago' },
  { name: 'Marcus Sterling', specialization: 'Meditation & Breathwork', time: '5h ago' },
  { name: 'Sarah Chen', specialization: 'Nutrition & Lifestyle', time: '1d ago' },
  { name: 'Dr. Emma Reed', specialization: 'Trauma-informed Therapy', time: '2h ago' },

]

const transactions = [
  { name: 'James Dunn', type: 'Therapy intake', amount: '$120.00', status: 'Completed' },
  { name: 'Maya R. Patel', type: 'Nutrition consult', amount: '$85.00', status: 'Completed' },
  { name: 'Alicia Lee', type: 'Meditation session', amount: '$45.00', status: 'Completed' },
  { name: 'Tom Harris', type: 'Performance coaching', amount: '$200.00', status: 'Pending' },
]

function KpiCard({ label, value, subtitle, delta, deltaTone }) {
  const deltaClasses =
    deltaTone === 'neg' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'

  return (
    <div className="figma-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-wide text-[var(--figma-text-muted)]">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">{value}</div>
          {subtitle ? <div className="mt-1 text-xs text-[var(--figma-text-muted)]">{subtitle}</div> : null}
        </div>
        <span className={['inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold', deltaClasses].join(' ')}>
          {delta}
        </span>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
        {stats.map((s) => (
          <KpiCard key={s.label} {...s} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* Revenue flow */}
        <div className="lg:col-span-8 h-full">
          <div className="figma-card h-full rounded-[12px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Monthly Revenue Flow</div>
                <div className="mt-1 text-xs text-[var(--figma-text-muted)]">
                  Calculated from practitioner earnings and payouts
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 py-2 text-xs font-semibold text-[var(--figma-text)]">
                Last 6 months
              </div>
            </div>

            <div className="mt-5">
              <div className="grid h-[220px] grid-cols-6 items-end gap-3 rounded-[12px] bg-[var(--figma-input-bg)] p-4 sm:h-[260px]">
                {[28, 34, 46, 40, 58, 78].map((h, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-3">
                    <div className="w-full rounded-[10px] bg-[rgba(27,20,100,0.10)]">
                      <div
                        className="w-full rounded-[10px] bg-[var(--figma-brand)]"
                        style={{ height: `${h * 2}px` }}
                      />
                    </div>
                    <div className="text-[11px] font-semibold text-[var(--figma-text-muted)]">
                      {['APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'][idx]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Approvals */}
        <div className="lg:col-span-4">
          <div className="figma-card rounded-[12px] p-5 sm:p-6 lg:min-h-[360px]">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[var(--figma-text-strong)]">New Joinings</div>
            </div>
            <div className="mt-4 space-y-3">
              {approvals.map((a) => (
                <div
                  key={a.name}
                  className="flex items-center gap-3 rounded-[12px] border border-[var(--figma-stroke)] bg-white p-3"
                >
                  <div className="h-9 w-9 rounded-full bg-[var(--figma-input-bg)]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[var(--figma-text-strong)]">{a.name}</div>
                    <div className="mt-0.5 truncate text-xs text-[var(--figma-text-muted)]">{a.specialization}</div>
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--figma-text-muted)]/70">{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Transactions */}
        <div className="lg:col-span-8">
          <div className="figma-card rounded-[12px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Recent Transactions</div>
              <button type="button" className="text-xs font-semibold text-[var(--figma-brand)] hover:underline">
                View all
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-xs text-[var(--figma-text-muted)]">
                  <tr className="border-b border-[var(--figma-stroke)]">
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Session type</th>
                    <th className="pb-3 text-right font-semibold">Amount</th>
                    <th className="pb-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.name} className="border-b border-[rgba(200,197,210,0.15)] last:border-b-0">
                      <td className="py-3 font-semibold text-[var(--figma-text-strong)]">{t.name}</td>
                      <td className="py-3 text-[var(--figma-text)]">{t.type}</td>
                      <td className="py-3 text-right font-semibold text-[var(--figma-text-strong)]">{t.amount}</td>
                      <td className="py-3 text-right">
                        <span
                          className={[
                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                            t.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700',
                          ].join(' ')}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </section>
    </div>
  )
}

export default Dashboard
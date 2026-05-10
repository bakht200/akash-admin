/**
 * Sessions list + detail. Route param matches `id` (e.g. SESS-89318-3, AK-5935).
 */

export const SESSION_TOTAL = 1248

export const SESSION_LIST_ROWS = [
  {
    id: 'AK-5935',
    dateTime: 'Oct 24, 2023 · 14:30 – 15:15',
    clientName: 'Sarah Jenkins',
    practitionerName: 'Dr. Marcus Thorne',
    modality: 'Somatic Therapy',
    status: 'Upcoming',
    fee: 120,
    total: 120,
  },
  {
    id: 'AK-5936',
    dateTime: 'Oct 24, 2023 · 13:00 – 13:45',
    clientName: 'Marcus Chen',
    practitionerName: 'Dr. Elena Rodriguez',
    modality: 'Acupuncture',
    status: 'Active',
    fee: 95,
    total: 95,
  },
  {
    id: 'AK-5937',
    dateTime: 'Oct 23, 2023 · 16:00 – 16:30',
    clientName: 'Priya Nair',
    practitionerName: 'James T. Sterling',
    modality: 'CBT Therapy',
    status: 'Disputed',
    fee: 150,
    total: 150,
  },
  {
    id: 'AK-5938',
    dateTime: 'Oct 22, 2023 · 10:00 – 10:50',
    clientName: 'Jordan Blake',
    practitionerName: 'Mark Chen',
    modality: 'Yoga',
    status: 'Cancelled',
    fee: 80,
    total: 0,
  },
  {
    id: 'SESS-89318-3',
    dateTime: 'Oct 24, 2023 · 14:00 – 14:45',
    clientName: 'Sarah Jenkins',
    practitionerName: 'Dr. Marcus Thorne',
    modality: 'Somatic Therapy',
    status: 'Completed',
    fee: 120,
    total: 120,
  },
]

/** Full detail for hero session + defaults for others */
const DETAIL_BY_ID = {
  'SESS-89318-3': {
    overviewStatus: 'Completed',
    durationMinutes: 45,
    dateLabel: 'Oct 24, 2023',
    timeLabel: '14:00 – 14:45 EST',
    video: {
      title: 'MedRTC Encrypted Gateway',
      url: 'https://meet.medrtc.akash.life/s/89318-3',
    },
    client: {
      name: 'Sarah Jenkins',
      subtitle: 'Client since May 2022',
    },
    practitioner: {
      name: 'Dr. Marcus Thorne',
      subtitle: 'Senior Practitioner · Licensed',
    },
    timeline: [
      { label: 'Session Booked', when: 'Oct 20, 2023 · 9:12 AM' },
      { label: 'Practitioner Checked-in', when: 'Oct 24, 2023 · 1:56 PM' },
      { label: 'Client Checked-in', when: 'Oct 24, 2023 · 2:01 PM' },
      { label: 'Session Ended', when: 'Oct 24, 2023 · 2:46 PM' },
    ],
    financial: {
      gross: 120,
      platformFee: -2,
      processingPct: 3,
      processingFee: -3.6,
      payout: 114.4,
      payoutDate: 'Nov 01, 2023',
    },
    adminNote:
      'Connection briefly dropped at 14:12 — both parties rejoined within 90s. No refund requested. — ADMIN SARAH B.',
  },
}

export function getSessionDetail(id) {
  const row = SESSION_LIST_ROWS.find((r) => r.id === id)
  const extra = DETAIL_BY_ID[id]

  if (!row) {
    return {
      id: id || 'UNKNOWN',
      listRow: null,
      overviewStatus: 'Completed',
      durationMinutes: 45,
      dateLabel: '—',
      timeLabel: '—',
      video: {
        title: 'MedRTC Encrypted Gateway',
        url: 'https://meet.medrtc.akash.life/s/unknown',
      },
      client: { name: 'Unknown', subtitle: '—' },
      practitioner: { name: 'Unknown', subtitle: '—' },
      timeline: [],
      financial: {
        gross: 0,
        platformFee: 0,
        processingPct: 3,
        processingFee: 0,
        payout: 0,
        payoutDate: '—',
      },
      adminNote: 'No notes on file.',
    }
  }

  if (extra) {
    return {
      id: row.id,
      listRow: row,
      ...extra,
    }
  }

  const status = row.status
  return {
    id: row.id,
    listRow: row,
    overviewStatus: status,
    durationMinutes: 45,
    dateLabel: row.dateTime.split('·')[0]?.trim() ?? '—',
    timeLabel: row.dateTime.includes('·') ? row.dateTime.split('·').slice(1).join('·').trim() : row.dateTime,
    video: {
      title: 'MedRTC Encrypted Gateway',
      url: `https://meet.medrtc.akash.life/s/${encodeURIComponent(row.id)}`,
    },
    client: {
      name: row.clientName,
      subtitle: 'Registered client',
    },
    practitioner: {
      name: row.practitionerName,
      subtitle: 'Practitioner',
    },
    timeline: [
      { label: 'Session created', when: row.dateTime },
      { label: 'Last updated', when: row.dateTime },
    ],
    financial: (() => {
      const gross = row.fee
      const platformFee = -2
      const processingFee = -Math.round(gross * 0.03 * 100) / 100
      const payout = Math.max(0, gross + platformFee + processingFee)
      return {
        gross,
        platformFee,
        processingPct: 3,
        processingFee,
        payout,
        payoutDate: 'Pending',
      }
    })(),
    adminNote: '—',
  }
}

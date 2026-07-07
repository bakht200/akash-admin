/**
 * Sessions list + detail. Route param matches `id` (UUID).
 */

export const SESSION_TOTAL = 1248

export const SESSION_LIST_ROWS = [
  {
    id: 'a5935001-0000-4000-8000-000000059350',
    dateTime: 'Oct 24, 2023 · 14:30 – 15:15',
    clientName: 'Sarah Jenkins',
    practitionerName: 'Dr. Marcus Thorne',
    modality: 'Somatic Therapy',
    status: 'confirmed',
    fee: 120,
    total: 120,
  },
  {
    id: 'a5936001-0000-4000-8000-000000059360',
    dateTime: 'Oct 24, 2023 · 13:00 – 13:45',
    clientName: 'Marcus Chen',
    practitionerName: 'Dr. Elena Rodriguez',
    modality: 'Acupuncture',
    status: 'in_progress',
    fee: 95,
    total: 95,
  },
  {
    id: 'a5937001-0000-4000-8000-000000059370',
    dateTime: 'Oct 23, 2023 · 16:00 – 16:30',
    clientName: 'Priya Nair',
    practitionerName: 'James T. Sterling',
    modality: 'CBT Therapy',
    status: 'no_show',
    fee: 150,
    total: 150,
  },
  {
    id: 'a5938001-0000-4000-8000-000000059380',
    dateTime: 'Oct 22, 2023 · 10:00 – 10:50',
    clientName: 'Jordan Blake',
    practitionerName: 'Mark Chen',
    modality: 'Yoga',
    status: 'cancelled',
    fee: 80,
    total: 0,
  },
  {
    id: '89318003-0000-4000-8000-000000089318',
    dateTime: 'Oct 24, 2023 · 14:00 – 14:45',
    clientName: 'Sarah Jenkins',
    practitionerName: 'Dr. Marcus Thorne',
    modality: 'Somatic Therapy',
    status: 'completed',
    fee: 120,
    total: 120,
  },
]

/** Full detail for hero session + defaults for others */
const DETAIL_BY_ID = {
  '89318003-0000-4000-8000-000000089318': {
    overviewStatus: 'completed',
    durationMinutes: 45,
    dateLabel: 'Oct 24, 2023',
    timeLabel: '14:00 – 14:45 EST',
    video: {
      roomId: 'agora-room-89318-3',
      joinWindowStart: 'Oct 24, 2023 · 1:45 PM',
      joinWindowEnd: 'Oct 24, 2023 · 3:00 PM',
      healerJoinedAt: 'Oct 24, 2023 · 1:56 PM',
      clientJoinedAt: 'Oct 24, 2023 · 2:01 PM',
    },
    client: {
      id: 'c1042100-0000-4000-8000-000000010421',
      name: 'Sarah Jenkins',
      subtitle: 'Client since May 2022',
    },
    practitioner: {
      id: 'elena-rodriguez',
      name: 'Dr. Marcus Thorne',
      subtitle: 'Licensed Practitioner',
    },
    timeline: [
      { label: 'Session Booked', when: 'Oct 20, 2023 · 9:12 AM' },
      { label: 'Practitioner Checked-in', when: 'Oct 24, 2023 · 1:56 PM' },
      { label: 'Client Checked-in', when: 'Oct 24, 2023 · 2:01 PM' },
      { label: 'Session Ended', when: 'Oct 24, 2023 · 2:46 PM' },
    ],
    financial: {
      sessionEarning: 120,
      commissionRate: 0.22,
      commissionFee: -26.4,
      platformFee: -2,
      healerNet: 91.6,
      walletState: 'available',
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
      id: id || 'unknown',
      listRow: null,
      overviewStatus: 'completed',
      durationMinutes: 45,
      dateLabel: '—',
      timeLabel: '—',
      video: {
        roomId: '—',
        joinWindowStart: '—',
        joinWindowEnd: '—',
        healerJoinedAt: null,
        clientJoinedAt: null,
      },
      client: { id: null, name: 'Unknown', subtitle: '—' },
      practitioner: { id: null, name: 'Unknown', subtitle: '—' },
      timeline: [],
      financial: {
        sessionEarning: 0,
        commissionRate: 0.22,
        commissionFee: 0,
        platformFee: 0,
        healerNet: 0,
        walletState: 'pending',
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
      roomId: `agora-room-${row.id.slice(0, 8)}`,
      joinWindowStart: row.dateTime,
      joinWindowEnd: row.dateTime,
      healerJoinedAt: null,
      clientJoinedAt: null,
    },
    client: {
      id: null,
      name: row.clientName,
      subtitle: 'Registered client',
    },
    practitioner: {
      id: null,
      name: row.practitionerName,
      subtitle: 'Practitioner',
    },
    timeline: [
      { label: 'Session created', when: row.dateTime },
      { label: 'Last updated', when: row.dateTime },
    ],
    financial: (() => {
      const sessionEarning = row.fee
      const commissionRate = 0.22
      const commissionFee = -Math.round(sessionEarning * commissionRate * 100) / 100
      const platformFee = -2
      const healerNet = Math.max(0, sessionEarning + commissionFee + platformFee)
      return {
        sessionEarning,
        commissionRate,
        commissionFee,
        platformFee,
        healerNet,
        walletState: 'pending',
      }
    })(),
    adminNote: '—',
  }
}

/**
 * Single source of truth for practitioner list rows, profile detail, and verification review.
 * Keys must match route param :id (e.g. elena-rodriguez).
 */

export const PRACTITIONER_RECORDS = {
  'elena-rodriguez': {
    row: {
      id: 'elena-rodriguez',
      name: 'Dr. Elena Rodriguez',
      email: 'elena.r@akash.life',
      modalities: ['Acupuncture', 'Reiki'],
      status: 'Active',
      rating: 4.9,
      sessions: 142,
      earnings: 8520,
      price: 120,
    },
    profile: {
      name: 'Elena Rodriguez, PhD',
      idLabel: 'PRAC-99283-ER',
      joined: 'Oct 12, 2023',
      status: 'Active',
      bio:
        'Dr. Rodriguez is a clinical psychologist specializing in holistic wellness and somatic therapy. With over 15 years of experience, she integrates traditional psychotherapeutic techniques with mindfulness and body-centered approaches to help clients manage anxiety and professional burnout.',
      specialties: ['Somatic Therapy', 'CBT', 'Mindfulness'],
      price: 85,
      education: [
        { title: 'PhD in Clinical Psychology', meta: 'Stanford University • 2012' },
        { title: 'MS in Behavioral Science', meta: 'University of Pennsylvania • 2008' },
      ],
      certifications: ['Board Certified Clinical Psychologist', 'Holistic Wellness Practitioner (HWP)'],
      performance: { earnings: 42904.5, sessions: 512, rating: 4.9 },
      vault: [
        { name: 'Medical License.pdf', meta: 'Updated Oct 2023', status: 'Verified' },
        { name: 'Liability Insurance.pdf', meta: 'Exp: Jan 2025', status: 'Verified' },
      ],
      reviews: [
        { stars: 5, quote: 'Dr. Elena is incredibly perceptive and has helped me navigate high-stress periods…', meta: 'Client ID: 8219 • 2 days ago' },
        { stars: 5, quote: 'Grounded, compassionate, and practical. The sessions feel structured but warm.', meta: 'Client ID: 6401 • 2 weeks ago' },
      ],
      recentSessions: [
        { client: 'Marcus Aurelius', date: 'Mar 24, 2024', type: 'Virtual Therapy', fee: 85, status: 'Completed' },
        { client: 'Julia Domna', date: 'Mar 22, 2024', type: 'Introductory Call', fee: 45, status: 'Completed' },
        { client: 'Septimius Severus', date: 'Mar 21, 2024', type: 'Virtual Therapy', fee: 85, status: 'Cancelled' },
      ],
    },
    verification: {
      refId: 'PR-99283',
      tier: 'SENIOR PRACTITIONER',
      submittedAt: 'Request submitted Oct 12, 2023',
      similarityPct: 96,
      selfieEmoji: '👩‍⚕️',
      comparisonRows: [
        { attribute: 'Full Name', onDocument: 'Elena Rodriguez', inProfile: 'Elena Rodriguez', match: true, profileHighlight: false },
        { attribute: 'Date of Birth', onDocument: '03 Jun 1985', inProfile: '03 Jun 1985', match: true, profileHighlight: false },
        { attribute: 'ID Type', onDocument: 'Drivers License (CA)', inProfile: 'DL-449201', match: true, profileHighlight: false },
        { attribute: 'Expiry Date', onDocument: '01 Mar 2029', inProfile: '01 Mar 2029', match: true, profileHighlight: true },
      ],
      risk: {
        autoStatus: 'Verified (Clear)',
        statusTone: 'success',
        ip: 'San Francisco, US',
        device: 'Verified Device',
      },
    },
  },

  'james-sterling': {
    row: {
      id: 'james-sterling',
      name: 'James T. Sterling',
      email: 'j.sterling@zenith.com',
      modalities: ['CBT Therapy'],
      status: 'Pending',
      rating: null,
      sessions: 0,
      earnings: 0,
      price: 150,
    },
    profile: {
      name: 'James T. Sterling, LCSW',
      idLabel: 'PRAC-41022-JS',
      joined: 'Feb 03, 2024',
      status: 'Pending',
      bio:
        'James is a licensed clinical social worker focused on evidence-based therapy for anxiety and relationship conflict. He is currently completing onboarding verification for the Akash network.',
      specialties: ['CBT', 'Attachment', 'Stress Management'],
      price: 150,
      education: [
        { title: 'MSW, Clinical Track', meta: 'Columbia University • 2017' },
        { title: 'BA in Psychology', meta: 'University of Michigan • 2014' },
      ],
      certifications: ['Licensed Clinical Social Worker (LCSW)', 'Gottman Method (Level 1)'],
      performance: { earnings: 0, sessions: 0, rating: 0 },
      vault: [
        { name: 'License Verification.pdf', meta: 'Submitted Feb 2024', status: 'Pending' },
        { name: 'Background Check.pdf', meta: 'Submitted Feb 2024', status: 'Pending' },
      ],
      reviews: [],
      recentSessions: [],
    },
    verification: {
      refId: 'PR-8821',
      tier: 'ASSOCIATE PRACTITIONER',
      submittedAt: 'Request submitted Feb 03, 2024',
      similarityPct: 88,
      selfieEmoji: '👨‍💼',
      comparisonRows: [
        { attribute: 'Full Name', onDocument: 'James T. Sterling', inProfile: 'James T. Sterling', match: true, profileHighlight: false },
        { attribute: 'Date of Birth', onDocument: '14 May 1988', inProfile: '14 May 1988', match: true, profileHighlight: false },
        { attribute: 'ID Type', onDocument: 'Drivers License (NY)', inProfile: 'DL-001928', match: true, profileHighlight: false },
        { attribute: 'Expiry Date', onDocument: '12 Oct 2028', inProfile: '12 Oct 2028', match: true, profileHighlight: true },
      ],
      risk: {
        autoStatus: 'Flagged (Uncertain)',
        statusTone: 'warning',
        ip: 'New York, US',
        device: 'Verified Device',
      },
    },
  },

  'sarah-alfayed': {
    row: {
      id: 'sarah-alfayed',
      name: 'Sarah Al-Fayed',
      email: 'sarah@akash.life',
      modalities: ['Holistic Nutrition'],
      status: 'Active',
      rating: 4.7,
      sessions: 88,
      earnings: 3960,
      price: 45,
    },
    profile: {
      name: 'Sarah Al-Fayed, CNC',
      idLabel: 'PRAC-77810-SA',
      joined: 'Jul 19, 2023',
      status: 'Active',
      bio:
        'Sarah is a certified nutrition coach specializing in metabolic health and sustainable habits. She blends pragmatic nutrition planning with behavioral coaching to support long-term change.',
      specialties: ['Holistic Nutrition', 'Metabolic Health', 'Habit Coaching'],
      price: 45,
      education: [
        { title: 'Certified Nutrition Coach (CNC)', meta: 'Precision Nutrition • 2021' },
        { title: 'BS in Public Health', meta: 'University of Washington • 2018' },
      ],
      certifications: ['Precision Nutrition Level 1', 'Health Coach Certification (NBHWC)'],
      performance: { earnings: 12640.0, sessions: 312, rating: 4.7 },
      vault: [{ name: 'Certification.pdf', meta: 'Updated Aug 2023', status: 'Verified' }],
      reviews: [
        { stars: 5, quote: 'Simple plans that actually fit my schedule. Great accountability.', meta: 'Client ID: 2894 • 6 days ago' },
      ],
      recentSessions: [
        { client: 'Aisha Khan', date: 'Mar 28, 2024', type: 'Nutrition Follow-up', fee: 45, status: 'Completed' },
        { client: 'Daniel Kim', date: 'Mar 25, 2024', type: 'Initial Intake', fee: 65, status: 'Completed' },
      ],
    },
    verification: {
      refId: 'PR-77810',
      tier: 'CERTIFIED PRACTITIONER',
      submittedAt: 'Request submitted Jul 19, 2023',
      similarityPct: 94,
      selfieEmoji: '👩‍🍳',
      comparisonRows: [
        { attribute: 'Full Name', onDocument: 'Sarah Al-Fayed', inProfile: 'Sarah Al-Fayed', match: true, profileHighlight: false },
        { attribute: 'Date of Birth', onDocument: '22 Jan 1990', inProfile: '22 Jan 1990', match: true, profileHighlight: false },
        { attribute: 'ID Type', onDocument: 'Passport (US)', inProfile: 'P-778102', match: true, profileHighlight: false },
        { attribute: 'Expiry Date', onDocument: '09 Nov 2030', inProfile: '09 Nov 2030', match: true, profileHighlight: false },
      ],
      risk: {
        autoStatus: 'Verified (Clear)',
        statusTone: 'success',
        ip: 'Seattle, US',
        device: 'Verified Device',
      },
    },
  },

  'mark-chen': {
    row: {
      id: 'mark-chen',
      name: 'Mark Chen',
      email: 'mark.c@flowstate.me',
      modalities: ['Yoga', 'Meditation'],
      status: 'Suspended',
      rating: 3.2,
      sessions: 12,
      earnings: 960,
      price: 80,
    },
    profile: {
      name: 'Mark Chen, RYT-500',
      idLabel: 'PRAC-55091-MC',
      joined: 'Nov 08, 2022',
      status: 'Suspended',
      bio:
        'Mark is a yoga and meditation instructor with a focus on recovery and resilience. This account is currently suspended pending compliance review.',
      specialties: ['Yoga Therapy', 'Meditation', 'Breathwork'],
      price: 80,
      education: [
        { title: 'Yoga Teacher Training (500hr)', meta: 'Kripalu Center • 2019' },
        { title: 'Mindfulness-Based Stress Reduction', meta: 'UMass Center for Mindfulness • 2020' },
      ],
      certifications: ['RYT-500', 'MBSR Teacher (Candidate)'],
      performance: { earnings: 3960.0, sessions: 72, rating: 3.2 },
      vault: [{ name: 'Insurance.pdf', meta: 'Expired Jan 2025', status: 'Pending' }],
      reviews: [
        { stars: 3, quote: 'Great sessions, but scheduling has been inconsistent lately.', meta: 'Client ID: 1042 • 1 month ago' },
      ],
      recentSessions: [
        { client: 'Priya Nair', date: 'Feb 15, 2024', type: 'Guided Meditation', fee: 30, status: 'Completed' },
        { client: 'Luis Gomez', date: 'Feb 09, 2024', type: 'Yoga (Virtual)', fee: 80, status: 'Cancelled' },
      ],
    },
    verification: {
      refId: 'PR-55091',
      tier: 'ACCOUNT SUSPENDED',
      submittedAt: 'Request submitted Nov 08, 2022',
      similarityPct: 91,
      selfieEmoji: '🧘',
      comparisonRows: [
        { attribute: 'Full Name', onDocument: 'Mark Chen', inProfile: 'Mark Chen', match: true, profileHighlight: false },
        { attribute: 'Date of Birth', onDocument: '11 Aug 1992', inProfile: '11 Aug 1992', match: true, profileHighlight: false },
        { attribute: 'ID Type', onDocument: 'Drivers License (MA)', inProfile: 'DL-550912', match: true, profileHighlight: false },
        { attribute: 'Expiry Date', onDocument: '12 Oct 2028', inProfile: '12 Oct 2027', match: true, profileHighlight: true },
      ],
      risk: {
        autoStatus: 'High risk (Compliance)',
        statusTone: 'danger',
        ip: 'Boston, US',
        device: 'New device detected',
      },
    },
  },

  'emma-thompson': {
    row: {
      id: 'emma-thompson',
      name: 'Emma Thompson',
      email: 'emma@wellbeing.co',
      modalities: ['Massage Therapy'],
      status: 'Active',
      rating: 4.8,
      sessions: 210,
      earnings: 18900,
      price: 90,
    },
    profile: {
      name: 'Emma Thompson, LMT',
      idLabel: 'PRAC-66304-ET',
      joined: 'May 27, 2023',
      status: 'Active',
      bio:
        'Emma is a licensed massage therapist specializing in sports recovery and chronic tension. She uses a client-first approach and integrates mobility education into recovery plans.',
      specialties: ['Massage Therapy', 'Sports Recovery', 'Mobility'],
      price: 90,
      education: [{ title: 'Diploma in Massage Therapy', meta: 'Cortiva Institute • 2016' }],
      certifications: ['Licensed Massage Therapist (LMT)', 'CPR/AED'],
      performance: { earnings: 18900.0, sessions: 210, rating: 4.8 },
      vault: [
        { name: 'License.pdf', meta: 'Updated May 2023', status: 'Verified' },
        { name: 'Insurance.pdf', meta: 'Exp: Dec 2024', status: 'Verified' },
      ],
      reviews: [
        { stars: 5, quote: 'Best recovery work I’ve had—felt a difference after the first session.', meta: 'Client ID: 7710 • 4 days ago' },
        { stars: 5, quote: 'Professional, attentive, and very skilled.', meta: 'Client ID: 1148 • 3 weeks ago' },
      ],
      recentSessions: [
        { client: 'Noah Patel', date: 'Mar 30, 2024', type: 'Sports Massage', fee: 90, status: 'Completed' },
        { client: 'Sofia Rossi', date: 'Mar 27, 2024', type: 'Deep Tissue', fee: 100, status: 'Completed' },
        { client: 'Ethan Brooks', date: 'Mar 19, 2024', type: 'Recovery Session', fee: 90, status: 'Completed' },
      ],
    },
    verification: {
      refId: 'PR-66304',
      tier: 'SENIOR PRACTITIONER',
      submittedAt: 'Request submitted May 27, 2023',
      similarityPct: 97,
      selfieEmoji: '💆',
      comparisonRows: [
        { attribute: 'Full Name', onDocument: 'Emma Thompson', inProfile: 'Emma Thompson', match: true, profileHighlight: false },
        { attribute: 'Date of Birth', onDocument: '30 Apr 1989', inProfile: '30 Apr 1989', match: true, profileHighlight: false },
        { attribute: 'ID Type', onDocument: 'Drivers License (OR)', inProfile: 'DL-663041', match: true, profileHighlight: false },
        { attribute: 'Expiry Date', onDocument: '15 Dec 2029', inProfile: '15 Dec 2029', match: true, profileHighlight: false },
      ],
      risk: {
        autoStatus: 'Verified (Clear)',
        statusTone: 'success',
        ip: 'Portland, US',
        device: 'Verified Device',
      },
    },
  },

  'robert-hyland': {
    row: {
      id: 'robert-hyland',
      name: 'Robert Hyland',
      email: 'robert.h@outlook.com',
      modalities: ['Breathwork'],
      status: 'Inactive',
      rating: 4.5,
      sessions: 42,
      earnings: 2100,
      price: 50,
    },
    profile: {
      name: 'Robert Hyland',
      idLabel: 'PRAC-29017-RH',
      joined: 'Jan 14, 2022',
      status: 'Inactive',
      bio:
        'Robert is a breathwork facilitator emphasizing practical tools for emotional regulation. This profile is currently inactive.',
      specialties: ['Breathwork', 'Nervous System Regulation'],
      price: 50,
      education: [{ title: 'Breathwork Facilitator Training', meta: 'Alchemy of Breath • 2020' }],
      certifications: ['Breathwork Facilitator', 'Trauma-Informed Coaching'],
      performance: { earnings: 2100.0, sessions: 42, rating: 4.5 },
      vault: [{ name: 'Certification.pdf', meta: 'Updated Jan 2022', status: 'Verified' }],
      reviews: [
        { stars: 5, quote: 'The breathing techniques were immediately helpful for my anxiety.', meta: 'Client ID: 3009 • 2 months ago' },
      ],
      recentSessions: [{ client: 'Mina Lee', date: 'Dec 12, 2023', type: 'Breathwork', fee: 50, status: 'Completed' }],
    },
    verification: {
      refId: 'PR-29017',
      tier: 'INACTIVE PROFILE',
      submittedAt: 'Request submitted Jan 14, 2022',
      similarityPct: 89,
      selfieEmoji: '🧔',
      comparisonRows: [
        { attribute: 'Full Name', onDocument: 'Robert Hyland', inProfile: 'Robert Hyland', match: true, profileHighlight: false },
        { attribute: 'Date of Birth', onDocument: '07 Feb 1987', inProfile: '07 Feb 1987', match: true, profileHighlight: false },
        { attribute: 'ID Type', onDocument: 'Drivers License (CO)', inProfile: 'DL-290177', match: true, profileHighlight: false },
        { attribute: 'Expiry Date', onDocument: '20 Jun 2026', inProfile: '20 Jun 2026', match: true, profileHighlight: false },
      ],
      risk: {
        autoStatus: 'Stale profile (No recent activity)',
        statusTone: 'muted',
        ip: 'Denver, US',
        device: 'Known device',
      },
    },
  },
}

export const practitionerListRows = Object.values(PRACTITIONER_RECORDS).map((r) => r.row)

export function getPractitionerRecord(id) {
  return id ? PRACTITIONER_RECORDS[id] : undefined
}

/** Display name as shown on the practitioners table (breadcrumb / headers). */
export function getPractitionerListName(id) {
  return getPractitionerRecord(id)?.row?.name
}

export function getPractitionerProfile(id) {
  const rec = getPractitionerRecord(id)
  if (rec) return rec.profile

  const fallbackName = id
    ? String(id)
        .split('-')
        .map((p) => p[0]?.toUpperCase() + p.slice(1))
        .join(' ')
    : 'Practitioner'
  return {
    name: fallbackName,
    idLabel: `PRAC-${String(id ?? 'UNKNOWN').toUpperCase()}`,
    joined: '—',
    status: 'Active',
    bio: 'This practitioner profile is ready to be connected to real data.',
    specialties: ['—'],
    price: 0,
    education: [],
    certifications: [],
    performance: { earnings: 0, sessions: 0, rating: 0 },
    vault: [],
    reviews: [],
    recentSessions: [],
  }
}

export function getPractitionerVerification(id) {
  const rec = getPractitionerRecord(id)
  const listName =
    rec?.row.name ??
    (id
      ? String(id)
          .split('-')
          .map((p) => p[0]?.toUpperCase() + p.slice(1))
          .join(' ')
      : 'Practitioner')

  if (rec?.verification) {
    return {
      listName,
      refId: rec.verification.refId,
      tier: rec.verification.tier,
      submittedAt: rec.verification.submittedAt,
      similarityPct: rec.verification.similarityPct,
      comparisonRows: rec.verification.comparisonRows,
      risk: rec.verification.risk,
      selfieEmoji: rec.verification.selfieEmoji ?? '👤',
      idImageLabel: 'GOVERNMENT ID',
      selfieLabel: 'VERIFICATION SELFIE',
    }
  }

  const slugRef = String(id ?? 'UNK')
    .replace(/-/g, '')
    .slice(0, 6)
    .toUpperCase()
  return {
    listName,
    refId: `PR-${slugRef}`,
    tier: 'PRACTITIONER',
    submittedAt: 'Request submitted —',
    similarityPct: 85,
    comparisonRows: [
      { attribute: 'Full Name', onDocument: listName, inProfile: listName, match: true, profileHighlight: false },
      { attribute: 'Date of Birth', onDocument: '—', inProfile: '—', match: false, profileHighlight: false },
      { attribute: 'ID Type', onDocument: '—', inProfile: '—', match: false, profileHighlight: false },
      { attribute: 'Expiry Date', onDocument: '—', inProfile: '—', match: false, profileHighlight: false },
    ],
    risk: {
      autoStatus: 'Pending manual review',
      statusTone: 'warning',
      ip: '—',
      device: '—',
    },
    selfieEmoji: '👤',
    idImageLabel: 'GOVERNMENT ID',
    selfieLabel: 'VERIFICATION SELFIE',
  }
}

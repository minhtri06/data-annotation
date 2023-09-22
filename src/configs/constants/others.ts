export const TOKEN_TYPES = {
  ACCESS_TOKEN: 'access-token',
  REFRESH_TOKEN: 'refresh-token',
} as const

export const PROJECT_STATUS = {
  SETUP: 'setup',
  OPEN_FOR_JOINING: 'open-for-joining',
  ANNOTATING: 'annotating',
  DONE: 'done',
} as const

export const SAMPLE_STATUS = {
  NEW: 'new',
  ANNOTATED: 'annotated',
  MARKED_AS_A_MISTAKE: 'marked-as-a-mistake',
  APPROVED: 'approved',
} as const

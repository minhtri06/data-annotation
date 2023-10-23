export const TOKEN_TYPES = {
  ACCESS_TOKEN: 'access-token',
  REFRESH_TOKEN: 'refresh-token',
} as const

export const PROJECT_PHASES = {
  SETTING_UP: 'setting-up',
  OPEN_FOR_JOINING: 'open-for-joining',
  ANNOTATING: 'annotating',
  DONE: 'done',
} as const

export const SAMPLE_STATUSES = {
  NEW: 'new',
  ANNOTATED: 'annotated',
  MARKED_AS_A_MISTAKE: 'marked-as-a-mistake',
} as const

export const USER_WORK_STATUSES = {
  ON: 'on',
  OFF: 'off',
} as const

export const ROLES = [
  'admin',
  'manager',
  'level-1-annotator',
  'level-2-annotator',
] as const

export const PRIVILEGES = ['get-users'] as const

const ROLE_PRIVILEGES: Readonly<
  Record<(typeof ROLES)[number], (typeof PRIVILEGES)[number][]>
> = {
  admin: ['get-users'],
  manager: ['get-users'],
  'level-1-annotator': [],
  'level-2-annotator': [],
}
export default ROLE_PRIVILEGES

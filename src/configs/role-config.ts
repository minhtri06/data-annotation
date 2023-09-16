export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  LEVEL_1_ANNOTATOR: 'level-1-annotator',
  LEVEL_2_ANNOTATOR: 'level-2-annotator',
} as const

export const PRIVILEGES = { GET_USERS: 'get-users' } as const

const ROLE_PRIVILEGES: Readonly<
  Record<
    (typeof ROLES)[keyof typeof ROLES],
    (typeof PRIVILEGES)[keyof typeof PRIVILEGES][]
  >
> = {
  [ROLES.ADMIN]: [PRIVILEGES.GET_USERS],
  [ROLES.MANAGER]: [PRIVILEGES.GET_USERS],
  [ROLES.LEVEL_1_ANNOTATOR]: [],
  [ROLES.LEVEL_2_ANNOTATOR]: [],
}
export default ROLE_PRIVILEGES

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ANNOTATOR: 'annotator',
} as const

export const PRIVILEGES = {
  GET_USERS: 'get-users',
  CREATE_USERS: 'create-users',
  UPDATE_USERS: 'update-users',
  CREATE_PROJECT_TYPES: 'create-project-types',
} as const

const { GET_USERS, CREATE_USERS, UPDATE_USERS, CREATE_PROJECT_TYPES } = PRIVILEGES

const ROLE_PRIVILEGES: Readonly<
  Record<
    (typeof ROLES)[keyof typeof ROLES],
    (typeof PRIVILEGES)[keyof typeof PRIVILEGES][]
  >
> = {
  [ROLES.ADMIN]: [GET_USERS, CREATE_USERS, UPDATE_USERS, CREATE_PROJECT_TYPES],
  [ROLES.MANAGER]: [GET_USERS],
  [ROLES.ANNOTATOR]: [GET_USERS],
}
export default ROLE_PRIVILEGES

export type role = 'admin' | 'manager' | 'level-1-annotator' | 'level-2-annotator'
export type privileges = 'get-users' | 'manage-user'

const rolePrivileges: Record<role, privileges[]> = {
  admin: ['get-users'],
  manager: ['get-users'],
  'level-1-annotator': [],
  'level-2-annotator': [],
}

export default rolePrivileges

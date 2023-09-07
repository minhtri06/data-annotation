export type role = 'admin' | 'manager' | 'level-1-annotator' | 'level-2-annotator'
export type privilege = 'get-users' | 'manage-user'

const rolePrivileges: Record<role, privilege[]> = {
  admin: ['get-users'],
  manager: ['get-users'],
  'level-1-annotator': [],
  'level-2-annotator': [],
}

export default rolePrivileges

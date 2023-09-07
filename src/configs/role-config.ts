import { Privilege, Role } from '../ts/types/roles'

const rolePrivileges: Record<Role, Privilege[]> = {
  admin: ['get-users'],
  manager: ['get-users'],
  'level-1-annotator': [],
  'level-2-annotator': [],
}

export default rolePrivileges

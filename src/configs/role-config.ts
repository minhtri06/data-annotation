import { Privilege, Role } from '../types'

const ROLE_PRIVILEGES: Readonly<Record<Role, Privilege[]>> = {
  admin: ['get-users'],
  manager: ['get-users'],
  'level-1-annotator': [],
  'level-2-annotator': [],
}
export default ROLE_PRIVILEGES

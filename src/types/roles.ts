import { PRIVILEGES, ROLES } from '../configs/role-config'

export type Role = (typeof ROLES)[number]
export type Privilege = (typeof PRIVILEGES)[number]

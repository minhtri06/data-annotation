import { PRIVILEGES, ROLES } from '../configs/role-config'

export type Role = (typeof ROLES)[keyof typeof ROLES]
export type Privilege = (typeof PRIVILEGES)[keyof typeof PRIVILEGES]

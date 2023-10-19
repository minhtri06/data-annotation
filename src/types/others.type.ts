import { IToken } from '../models'
import { ROLES } from '../configs/role.config'

export type Role = (typeof ROLES)[keyof typeof ROLES]

export type JwtPayload = {
  sub: string
  iat: number
  exp: number
  type: IToken['type']
  role: Role
}

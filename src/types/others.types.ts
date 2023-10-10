import { IToken } from '../models/interfaces/token.interface'
import { DocumentId } from './custom-mongoose.type'
import { PRIVILEGES, ROLES } from '../configs/role.config'

export type Role = (typeof ROLES)[keyof typeof ROLES]
export type Privilege = (typeof PRIVILEGES)[keyof typeof PRIVILEGES]

export type JwtPayload = {
  sub: DocumentId
  iat: number
  exp: number
  type: IToken['type']
  role: Role
}

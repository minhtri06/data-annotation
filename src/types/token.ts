import { IToken } from '../models/interfaces/token.interface'
import { documentId } from './custom-mongoose'
import { Role } from './roles'

export type JwtPayload = {
  sub: documentId
  iat: number
  exp: number
  type: IToken['type']
  role: Role
}

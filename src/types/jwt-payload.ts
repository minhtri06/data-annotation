import { IToken } from '../models/interfaces/token.interface'
import { DocumentId } from './custom-mongoose'
import { Role } from './roles'

export type JwtPayload = {
  sub: DocumentId
  iat: number
  exp: number
  type: IToken['type']
  role: Role
}

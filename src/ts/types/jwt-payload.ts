import { Role } from './roles'

type JwtPayload = { sub: string; role: Role }

export default JwtPayload

import { Exception } from './exception'

export class UnauthorizedException extends Exception {
  constructor(
    message: string,
    { type, isOperational }: { type?: string; isOperational?: boolean } = {},
  ) {
    super(message, { type: type || 'unauthorized', isOperational })
  }
}

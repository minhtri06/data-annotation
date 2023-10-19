import { Exception } from './exception'

export class UnauthorizedException extends Exception {
  constructor(
    message: string,
    { type, isOperational = true }: { type?: string; isOperational?: boolean } = {},
  ) {
    super(message, { type, isOperational })
  }
}

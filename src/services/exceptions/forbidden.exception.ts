import { Exception } from './exception'

export class ForbiddenException extends Exception {
  constructor(
    message: string,
    { type, isOperational }: { type?: string; isOperational?: boolean } = {},
  ) {
    super(message, { type: type || 'forbidden', isOperational })
  }
}

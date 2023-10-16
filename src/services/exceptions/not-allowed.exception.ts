import { Exception } from './exception'

export class NotAllowedException extends Exception {
  constructor(
    message: string,
    { type, isOperational }: { type?: string; isOperational?: boolean } = {},
  ) {
    super(message, { type: type || 'not-allowed', isOperational })
  }
}

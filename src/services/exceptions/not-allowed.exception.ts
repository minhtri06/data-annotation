import { Exception } from './exception'

export class NotAllowedException extends Exception {
  constructor(
    message: string = 'Your action are not allowed',
    { type, isOperational = true }: { type?: string; isOperational?: boolean } = {},
  ) {
    super(message, { type, isOperational })
  }
}

import { Exception } from './exception'

export class ForbiddenException extends Exception {
  constructor(
    message: string,
    { type, isOperational = true }: { type?: string; isOperational?: boolean } = {},
  ) {
    super(message, { type, isOperational })
  }
}

import { Exception } from './exception'

export class DuplicateKeyException extends Exception {
  public path?: string

  constructor(
    message: string,
    {
      type,
      isOperational,
      path,
    }: { type?: string; isOperational?: boolean; path?: string } = {},
  ) {
    super(message, { type: type || 'duplicate-key', isOperational })
    this.path = path
  }
}

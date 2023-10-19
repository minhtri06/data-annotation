import { Exception } from './exception'

export class DuplicateKeyException extends Exception {
  public path?: string

  constructor(
    message: string,
    {
      type,
      isOperational = true,
      path,
    }: { type?: string; isOperational?: boolean; path?: string } = {},
  ) {
    super(message, { type, isOperational })
    this.path = path
  }
}

export class Exception extends Error {
  public type: string
  public isOperational: boolean

  constructor(
    message: string,
    { type, isOperational }: { type?: string; isOperational?: boolean } = {},
  ) {
    super(message)
    this.type = type || 'exception'
    this.isOperational = isOperational || true
  }
}

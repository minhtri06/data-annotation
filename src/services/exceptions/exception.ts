export class Exception extends Error {
  public type?: string
  public isOperational: boolean

  constructor(
    message: string,
    { type, isOperational = false }: { type?: string; isOperational?: boolean } = {},
  ) {
    super(message)
    this.type = type
    this.isOperational = isOperational
  }
}

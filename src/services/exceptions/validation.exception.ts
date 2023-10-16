import { Exception } from './exception'

export class ValidationException extends Exception {
  public details?: {
    path: string
    message: string
  }[]

  constructor(
    message: string,
    {
      type,
      isOperational,
      details,
    }: {
      type?: string
      isOperational?: boolean
      details?: {
        path: string
        message: string
      }[]
    } = {},
  ) {
    super(message, { type: type || 'validation', isOperational })
    this.details = details
  }
}

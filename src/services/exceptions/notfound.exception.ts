import { Exception } from './exception'

export class NotfoundException extends Exception {
  public model?: string

  constructor(
    message: string,
    {
      type,
      isOperational,
      model,
    }: { type?: string; isOperational?: boolean; model?: string } = {},
  ) {
    super(message, { type: type || 'not-found', isOperational })
    this.model = model
  }
}

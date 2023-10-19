import { Exception } from './exception'

export class NotfoundException extends Exception {
  public model?: string

  constructor(
    message: string,
    {
      type,
      isOperational = true,
      model,
    }: { type?: string; isOperational?: boolean; model?: string } = {},
  ) {
    super(message, { type, isOperational })
    this.model = model
  }
}

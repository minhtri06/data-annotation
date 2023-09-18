import { StatusCodes } from 'http-status-codes'

export class ApiError extends Error {
  public statusCode: number
  public type?: string

  constructor(
    statusCode: (typeof StatusCodes)[keyof typeof StatusCodes],
    message: string,
    { type }: { type?: string } = {},
  ) {
    super(message)
    this.statusCode = statusCode
    this.type = type
  }
}

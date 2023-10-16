import { StatusCodes } from 'http-status-codes'

import {
  DuplicateKeyException,
  Exception,
  ForbiddenException,
  NotAllowedException,
  NotfoundException,
  UnauthorizedException,
  ValidationException,
} from '@src/services/exceptions'

export const exceptionToStatusCode = (err: Exception) => {
  if (err instanceof ValidationException) return StatusCodes.BAD_REQUEST
  if (err instanceof NotAllowedException) return StatusCodes.BAD_REQUEST
  if (err instanceof DuplicateKeyException) return StatusCodes.BAD_REQUEST
  if (err instanceof NotfoundException) return StatusCodes.NOT_FOUND
  if (err instanceof UnauthorizedException) return StatusCodes.UNAUTHORIZED
  if (err instanceof ForbiddenException) return StatusCodes.FORBIDDEN

  return StatusCodes.INTERNAL_SERVER_ERROR
}

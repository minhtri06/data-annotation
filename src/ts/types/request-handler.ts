import { NextFunction, Request, Response } from 'express'
import { IUser } from '../interfaces/user'

type CustomRequest = Request & { user?: IUser | Pick<IUser, '_id' | 'role'> }

export type RequestHandler = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => Promise<Response | void> | Response | void

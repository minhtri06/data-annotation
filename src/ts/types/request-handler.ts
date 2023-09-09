import { NextFunction, Request, Response } from 'express'
import { IUser } from '../models/user'

type CustomRequest = Request<object, object, object, object> & {
  user?: IUser | Pick<IUser, '_id' | 'role'>
}

export type RequestHandler<ReqContext = object> = (
  req: CustomRequest & ReqContext,
  res: Response,
  next: NextFunction,
) => Promise<Response | void> | Response | void

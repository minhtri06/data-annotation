import { NextFunction, Request, Response } from 'express'
import { IUser } from '../interfaces/user'

interface CustomRequest<Body = object, Params = object, Query = object>
  extends Request<Params, object, Body, Query> {
  user?: IUser | Pick<IUser, '_id' | 'role'>
}

export type RequestHandler<Body = object, Params = object, Query = object> = (
  req: CustomRequest<Body, Params, Query>,
  res: Response,
  next: NextFunction,
) => Promise<Response | void> | Response | void

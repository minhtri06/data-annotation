import { NextFunction, Request, Response } from 'express'
import { IUser } from '../models/interfaces'
import { Model } from 'mongoose'

export type CustomRequest<ReqSchema> = Request<object, object, object, object> & {
  user?: Model<IUser> | Pick<IUser, '_id' | 'role'>
} & ReqSchema

export type ReqHandler<ReqSchema = object> = (
  req: CustomRequest<ReqSchema>,
  res: Response,
  next: NextFunction,
) => Promise<Response | void> | Response | void

import { NextFunction, Request, Response } from 'express'
import { Model } from 'mongoose'

import { IUser } from '../models/interfaces'
import { RequestSchema } from './request-schemas'

export type CustomRequest<ReqSchema extends RequestSchema> = Request<
  Exclude<RequestSchema['params'], undefined>,
  object,
  Exclude<RequestSchema['body'], undefined>,
  Exclude<RequestSchema['query'], undefined>
> &
  Pick<ReqSchema, 'body' | 'params' | 'query'> & {
    user?: Model<IUser> | Pick<IUser, '_id' | 'role'>
  }

export type ReqHandler<ReqSchema extends RequestSchema = RequestSchema> = (
  req: CustomRequest<ReqSchema>,
  res: Response,
  next: NextFunction,
) => Promise<Response | void> | Response | void

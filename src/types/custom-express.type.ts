import { NextFunction, Request, Response } from 'express'

import { IUser } from '../models/interfaces'
import { RequestSchema } from '../controllers/request-schemas'

export type CustomRequest<ReqSchema extends RequestSchema = RequestSchema> = Request<
  Exclude<RequestSchema['params'], undefined>,
  object,
  Exclude<RequestSchema['body'], undefined>,
  Exclude<RequestSchema['query'], undefined>
> &
  Pick<ReqSchema, 'body' | 'params' | 'query'> & {
    user?: Pick<IUser, '_id' | 'role'>
  }

export type ReqHandler<ReqSchema extends RequestSchema = RequestSchema> = (
  req: CustomRequest<ReqSchema>,
  res: Response,
  next: NextFunction,
) => Promise<Response | void> | Response | void

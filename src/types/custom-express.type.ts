import { NextFunction, Request, Response } from 'express'

import { RequestSchema } from '../controllers/request-schemas'
import { IUser } from '@src/models'

export type CustomRequest<ReqSchema extends RequestSchema = RequestSchema> = Request<
  Exclude<RequestSchema['params'], undefined>,
  object,
  Exclude<RequestSchema['body'], undefined>,
  Exclude<RequestSchema['query'], undefined>
> &
  Pick<ReqSchema, 'body' | 'params' | 'query'> & {
    user?: { _id: string; role: IUser['role'] }
  }

export type ReqHandler<ReqSchema extends RequestSchema = RequestSchema> = (
  req: CustomRequest<ReqSchema>,
  res: Response,
  next: NextFunction,
) => Promise<Response | void> | Response | void

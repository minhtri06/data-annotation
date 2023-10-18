import { Request } from 'express'

import { IUser } from '@src/models'

export type RequestSchema = {
  body?: object
  params?: object
  query?: object
}

export type CustomRequest<ReqSchema extends RequestSchema = RequestSchema> = Request<
  Exclude<RequestSchema['params'], undefined>,
  object,
  Exclude<RequestSchema['body'], undefined>,
  Exclude<RequestSchema['query'], undefined>
> &
  Pick<ReqSchema, 'body' | 'params' | 'query'> & {
    user?: { _id: string; role: IUser['role'] }
  }

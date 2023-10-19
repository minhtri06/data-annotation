import { Request } from 'express'

import {
  IUser,
  ProjectDocument,
  ProjectTypeDocument,
  SampleDocument,
  UserDocument,
} from '@src/models'

export type RequestSchema = {
  body?: object
  params?: object
  query?: object
}

export type CustomRequest<ReqSchema extends RequestSchema = RequestSchema> = Request<
  object,
  object,
  object,
  object
> &
  Pick<ReqSchema, 'body' | 'params' | 'query'> & {
    user?: { id: string; role: IUser['role'] }
    data?: {
      projectType?: ProjectTypeDocument
      project?: ProjectDocument
      sample?: SampleDocument
      user?: UserDocument
    }
  }

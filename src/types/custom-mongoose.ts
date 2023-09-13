import { Document, IfAny, Require_id, Types } from 'mongoose'
import { EmptyObject } from './util-types'

export type documentId = Types.ObjectId | string

export type document<T> = IfAny<
  T,
  unknown,
  Document<unknown, EmptyObject, T> & T & Require_id<T>
>

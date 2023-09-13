import { Document, Types } from 'mongoose'
import { EmptyObject } from './util-types'

export type documentId = Types.ObjectId | string

export type document<T> = Document<unknown, EmptyObject, T> &
  T &
  Required<{ _id: string | import('mongoose').Types.ObjectId }>

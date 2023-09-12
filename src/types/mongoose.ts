import { Document, ObjectId } from 'mongoose'
import { EmptyObject } from './util-types'

export type document<T> = Document<ObjectId, EmptyObject, T> &
  T &
  Required<{
    _id: string | ObjectId
  }>

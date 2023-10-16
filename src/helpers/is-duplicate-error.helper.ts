import mongoose from 'mongoose'

export const isMongooseDuplicateError = (error: unknown) => {
  return (
    error instanceof mongoose.Error &&
    (error as { code?: number; keyValue?: string }).code === 11000 &&
    (error as { code?: number; keyValue?: string }).keyValue
  )
}

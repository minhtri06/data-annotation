import { StatusCodes } from 'http-status-codes'
import { connectMongoDb } from './helpers'
import { User } from './models'
import { ApiError } from './utils'

connectMongoDb()
  .then(async () => {
    const user = await User.findOne()
      .skip(100)
      .orFail(new ApiError(StatusCodes.NOT_FOUND, 'yolo'))
    console.log(user)
  })
  .catch((error) => console.log(error))

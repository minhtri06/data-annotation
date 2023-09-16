import { ErrorRequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import createError from 'http-errors'
import { Error as MongooseError } from 'mongoose'
import jwt from 'jsonwebtoken'
import Joi from 'joi'

import envConfig from '../configs/env-config'
import ROLE_PRIVILEGES from '../configs/role-config'
import { CustomSchemaMap, JwtPayload, Privilege, ReqHandler } from '../types'
import { RequestSchema } from '../types/request-schemas'
import { getObjectKeys } from '../utils/object-utils'

class GeneralMiddleware {
  public static handleNotFound: ReqHandler = (req, res) => {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Route not found' })
  }

  public static handleException: ErrorRequestHandler = (
    err: Error & { code?: number; keyValue?: { [key: string]: string } },
    req,
    res,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next,
  ) => {
    if (err instanceof createError.HttpError) {
      return res
        .status(err.statusCode)
        .json({ type: err.headers?.type, message: err.message })
    }

    if (err instanceof MongooseError.ValidationError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: err.message.replaceAll('"', "'") })
    }

    if (err.code === 11000 && err.keyValue) {
      const { keyValue } = err
      const message = Object.keys(keyValue)
        .map((key) => `${key} with value '${keyValue[key]}' already exists`)
        .join(', ')
      return res.status(StatusCodes.BAD_REQUEST).json({ message })
    }

    if (envConfig.NODE_ENV !== 'prod') {
      console.log(err)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message })
    } else {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Something went wrong' })
    }
  }

  public static auth = ({
    requiredPrivileges = [],
    required = true,
  }: {
    requiredPrivileges?: Privilege[]
    required?: boolean
  } = {}): ReqHandler => {
    return (req, res, next) => {
      const unauthorizedError = createError.Unauthorized('Unauthorized!')
      let accessToken = req.headers['authorization']
      accessToken = accessToken?.split(' ')[1]
      if (!accessToken) {
        if (!required) {
          return next()
        } else {
          throw unauthorizedError
        }
      }
      let payload
      try {
        payload = jwt.verify(accessToken, envConfig.JWT_SECRET) as JwtPayload
      } catch (error) {
        if (!required) {
          return next()
        } else {
          throw unauthorizedError
        }
      }
      if (requiredPrivileges.length !== 0) {
        const userPrivileges = ROLE_PRIVILEGES[payload.role]
        if (
          !requiredPrivileges.every((privilege) => userPrivileges.includes(privilege))
        ) {
          throw unauthorizedError
        }
      }
      req.user
      return next()
    }
  }

  public static validate = (
    requestSchema: CustomSchemaMap<RequestSchema>,
  ): ReqHandler => {
    return (req, res, next) => {
      const strictRequestSchema = {
        body: requestSchema.body || {},
        query: requestSchema.query || {},
        params: requestSchema.params || {},
      }
      const validation = Joi.object<typeof strictRequestSchema>(strictRequestSchema)
        .unknown()
        .validate(req, { errors: { wrap: { label: '' } } })
      if (validation.error) {
        return next(new createError.BadRequest(validation.error.message))
      }
      const value = validation.value
      for (const key of getObjectKeys(value)) {
        req[key] = value[key]
      }
      return next()
    }
  }
}

export default GeneralMiddleware

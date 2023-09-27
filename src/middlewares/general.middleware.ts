import { ErrorRequestHandler, RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import createHttpError from 'http-errors'
import { Error as MongooseError } from 'mongoose'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { injectable } from 'inversify'

import envConfig from '@src/configs/env.config'
import ROLE_PRIVILEGES from '../configs/role.config'
import { CustomSchemaMap, JwtPayload, Privilege, ReqHandler } from '../types'
import { getObjectKeys } from '../utils/object-utils'
import { ApiError, camelCaseToNormalText } from '../utils'
import { RequestSchema } from '../types/request-schemas'

export interface IGeneralMiddleware {
  handleNotFound: RequestHandler

  handleException: ErrorRequestHandler

  auth(options?: { requiredPrivileges?: Privilege[]; required?: boolean }): RequestHandler

  validate(requestSchema: CustomSchemaMap<RequestSchema>): RequestHandler
}

@injectable()
export class GeneralMiddleware implements IGeneralMiddleware {
  public handleNotFound: ReqHandler = (req, res) => {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Route not found' })
  }

  public handleException: ErrorRequestHandler = (
    err: Error & { code?: number; keyValue?: { [key: string]: string } },
    req,
    res,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next,
  ) => {
    if (err instanceof createHttpError.HttpError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, type: err.headers?.type })
    }
    if (err instanceof ApiError) {
      const { statusCode, type, message } = err
      return res.status(statusCode).json({ message, type })
    }

    if (err instanceof MongooseError.ValidationError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        // Show message of the first error
        message: err.errors[Object.keys(err.errors)[0]].message,
        type: 'validation-error',
      })
    }

    if (err.code === 11000 && err.keyValue) {
      const { keyValue } = err
      const message = Object.keys(keyValue)
        .map((key) => `${camelCaseToNormalText(key)} '${keyValue[key]}' already exists`)
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

  public auth = ({
    requiredPrivileges = [],
    required = true,
  }: {
    requiredPrivileges?: Privilege[]
    required?: boolean
  } = {}): ReqHandler => {
    return (req, res, next) => {
      const unauthorizedError = createHttpError.Unauthorized('Unauthorized!')

      let accessToken = req.headers['authorization']
      accessToken = accessToken?.split(' ')[1]

      if (!accessToken) {
        if (!required) {
          return next()
        } else {
          return next(unauthorizedError)
        }
      }

      let payload
      try {
        payload = jwt.verify(accessToken, envConfig.JWT_SECRET) as JwtPayload
      } catch (error) {
        if (!required) {
          return next()
        } else {
          return next(unauthorizedError)
        }
      }

      if (requiredPrivileges.length !== 0) {
        const userPrivileges = ROLE_PRIVILEGES[payload.role]
        if (
          !requiredPrivileges.every((privilege) => userPrivileges.includes(privilege))
        ) {
          next(createHttpError.Forbidden('Forbidden'))
        }
      }

      req.user = { _id: payload.sub, role: payload.role }
      return next()
    }
  }

  public validate = (requestSchema: CustomSchemaMap<RequestSchema>): ReqHandler => {
    return (req, res, next) => {
      const strictRequestSchema = {
        body: requestSchema.body || {},
        query: requestSchema.query || {},
        params: requestSchema.params || {},
      }
      const validation = Joi.object<typeof strictRequestSchema>(strictRequestSchema)
        .required()
        .unknown()
        .validate(req, { errors: { wrap: { label: '' }, label: 'key' } })
      if (validation.error) {
        return next(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            camelCaseToNormalText(validation.error.message),
            { type: 'validation-error' },
          ),
        )
      }
      const value = validation.value
      for (const key of getObjectKeys(value)) {
        req[key] = value[key]
      }
      return next()
    }
  }
}

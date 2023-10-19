import { ErrorRequestHandler, RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { injectable } from 'inversify'

import envConfig from '@src/configs/env.config'
import { CustomRequest, CustomSchemaMap, JwtPayload, RequestSchema, Role } from '../types'
import { omitFields } from '@src/utils'
import ENV_CONFIG from '@src/configs/env.config'
import {
  Exception,
  ForbiddenException,
  UnauthorizedException,
  ValidationException,
} from '@src/services/exceptions'
import { exceptionToStatusCode } from '@src/helpers'

export interface IGeneralMiddleware {
  handleNotFound: RequestHandler

  handleException: ErrorRequestHandler

  auth(options?: { requiredRoles?: Role[]; isRequired?: boolean }): RequestHandler

  validate(requestSchemaMap: CustomSchemaMap<RequestSchema>): RequestHandler
}

@injectable()
export class GeneralMiddleware implements IGeneralMiddleware {
  public handleNotFound: RequestHandler = (req, res) => {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Route not found' })
  }

  public handleException: ErrorRequestHandler = (
    err: Error & { code?: number; keyValue?: { [key: string]: string } },
    req,
    res,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next,
  ) => {
    const isOnProduction = ENV_CONFIG.NODE_ENV === 'prod'

    if (err instanceof Exception) {
      if (isOnProduction) {
        const statusCode = exceptionToStatusCode(err)
        const response = omitFields(err, 'name', 'isOperational', 'stack')

        if (err instanceof UnauthorizedException) {
          return res.status(statusCode).json({ message: 'Unauthorized' })
        }

        if (!err.isOperational) {
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: 'Internal server error' })
        }

        return res.status(statusCode).json(response)
      } else {
        const statusCode = exceptionToStatusCode(err)
        const response = omitFields(err, 'name', 'isOperational')

        if (!err.isOperational) {
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(isOnProduction ? { message: 'Internal server error' } : response)
        }

        response.stack = undefined
        return res.status(statusCode).json(response)
      }
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
    requiredRoles,
    isRequired = true,
  }: {
    requiredRoles?: Role[]
    isRequired?: boolean
  } = {}): RequestHandler => {
    return (req: CustomRequest, res, next) => {
      let accessToken = req.headers['authorization']
      accessToken = accessToken?.split(' ')[1]

      if (!accessToken) {
        if (!isRequired) {
          return next()
        } else {
          return next(new UnauthorizedException('Unauthorized'))
        }
      }

      let payload
      try {
        payload = jwt.verify(accessToken, envConfig.JWT_SECRET) as JwtPayload
      } catch (error) {
        if (!isRequired) {
          return next()
        } else {
          return next(new UnauthorizedException('Unauthorized'))
        }
      }

      if (requiredRoles && !requiredRoles.includes(payload.role)) {
        next(new ForbiddenException('Forbidden'))
      }

      req.user = { id: payload.sub, role: payload.role }
      return next()
    }
  }

  public validate = (
    requestSchemaMap: CustomSchemaMap<RequestSchema>,
  ): RequestHandler => {
    const strictRequestSchemaMap = {
      body: Joi.object(requestSchemaMap.body || {}).required(),
      query: Joi.object(requestSchemaMap.query || {}).required(),
      params: Joi.object(requestSchemaMap.params || {}).required(),
    }
    const validationSchema = Joi.object<typeof strictRequestSchemaMap>(
      strictRequestSchemaMap,
    )
      .required()
      .unknown()

    return (req, res, next) => {
      const validation = validationSchema.validate(req, {
        errors: { wrap: { label: "'" }, label: 'path' },
        abortEarly: false,
      })
      if (validation.error) {
        return next(
          new ValidationException(validation.error.message, {
            details: validation.error.details.map((detail) => ({
              message: detail.message,
              path: detail.context?.label as string,
            })),
          }),
        )
      }

      return next()
    }
  }
}

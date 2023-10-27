import { ErrorRequestHandler, RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { inject, injectable } from 'inversify'

import envConfig from '@src/configs/env.config'
import { CustomRequest, CustomSchemaMap, JwtPayload, RequestSchema, Role } from '../types'
import { pickFields } from '@src/utils'
import ENV_CONFIG from '@src/configs/env.config'
import {
  Exception,
  ForbiddenException,
  UnauthorizedException,
  ValidationException,
} from '@src/services/exceptions'
import { exceptionToStatusCode } from '@src/helpers'
import { TYPES } from '@src/constants'
import { IImageStorageService, ISampleStorageService } from '@src/services'

export interface IGeneralMiddleware {
  handleNotFound: RequestHandler

  handleException: ErrorRequestHandler

  auth: (options?: { requiredRoles?: Role[]; isRequired?: boolean }) => RequestHandler

  validate: (requestSchemaMap: CustomSchemaMap<RequestSchema>) => RequestHandler
}

@injectable()
export class GeneralMiddleware implements IGeneralMiddleware {
  constructor(
    @inject(TYPES.IMAGE_STORAGE_SERVICE)
    private imageStorageService: IImageStorageService,
    @inject(TYPES.SAMPLE_STORAGE_SERVICE)
    private sampleStorageService: ISampleStorageService,
  ) {}

  public handleNotFound: RequestHandler = (req, res) => {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Route not found' })
  }

  public handleException: ErrorRequestHandler = async (
    err: Error & { code?: number; keyValue?: { [key: string]: string } },
    req,
    res,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next,
  ) => {
    const isOnProduction = ENV_CONFIG.NODE_ENV === 'prod'

    if (req.file) {
      console.log('delete file')
      const [storageName] = req.file.fieldname.split(':')
      if (storageName === this.imageStorageService.storageName) {
        await this.imageStorageService.deleteFile(req.file.filename)
      }
      if (storageName === this.sampleStorageService.storageName) {
        await this.sampleStorageService.deleteFile(req.file.filename)
      }
    }

    if (err instanceof Exception) {
      const responseFields = [
        'message',
        'type',
        'details',
        'path',
        'model',
      ] as (keyof typeof err)[]

      if (isOnProduction) {
        const statusCode = exceptionToStatusCode(err)
        const response = pickFields(err, ...responseFields)

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
        const response = pickFields(err, ...responseFields, 'stack')

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
      console.log(payload)
      console.log(requiredRoles)

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
          new ValidationException('Validation failed', {
            details: validation.error.details.map((detail) => ({
              message: detail.message,
              path: detail.context?.label as string,
            })),
          }),
        )
      }

      for (const field of ['body', 'query', 'params'] as const) {
        req[field] = validation.value[field]
      }

      return next()
    }
  }
}

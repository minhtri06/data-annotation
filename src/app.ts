import 'reflect-metadata'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { InversifyExpressServer } from 'inversify-express-utils'

import ENV_CONFIG from './configs/env-config'
import { IGeneralMiddleware } from './middlewares'
import container from './configs/inversify-config'
import { TYPES } from './configs/constants'

const server = new InversifyExpressServer(container, null, { rootPath: '/api/v1' })

server.setConfig((app) => {
  // setup middlewares
  app.use(helmet())
  app.use(morgan('dev'))
  app.use(compression())
  app.use(
    cors({
      origin: ENV_CONFIG.CLIENT_URL,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    }),
  )
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
})

server.setErrorConfig((app) => {
  // handle error
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)
  app.use(generalMiddleware.handleNotFound)
  app.use(generalMiddleware.handleException)
})

const app = server.build()
export default app

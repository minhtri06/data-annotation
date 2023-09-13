import 'reflect-metadata'

import express, { ErrorRequestHandler } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { InversifyExpressServer } from 'inversify-express-utils'

import envConfig from './configs/env-config'
import { GeneralMiddleware } from './middlewares'
import container from './configs/inversify-config'

const server = new InversifyExpressServer(container, null, { rootPath: '/api/v1' })

server.setConfig((app) => {
  // setup middlewares
  app.use(helmet())
  app.use(morgan('dev'))
  app.use(compression())
  app.use(
    cors({
      origin: envConfig.CLIENT_URL,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    }),
  )
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
})

server.setErrorConfig((app) => {
  // handle error
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.use(GeneralMiddleware.handleNotFound)
  app.use(GeneralMiddleware.handleException)
  app.use(((err, req, res) => {
    res.send(':v')
  }) as ErrorRequestHandler)
})

const app = server.build()
export default app

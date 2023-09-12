import 'express-async-errors'
import 'reflect-metadata'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { InversifyExpressServer } from 'inversify-express-utils'
import { Container } from 'inversify'

import envConfig from './configs/env-config'
import { GeneralMiddleware } from './middlewares'
import './controllers'
import { IUserService } from './services/interfaces'
import { TYPES } from './constants'
import { UserService } from './services'
import { IUser } from './models/interfaces'
import { User } from './models'
import { Model } from 'mongoose'

const container = new Container()
container.bind<IUserService>(TYPES.USER_SERVICE).to(UserService)
container.bind<Model<IUser>>(TYPES.USER_MODEL).toConstantValue(User)

const server = new InversifyExpressServer(container)

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
})

export default server

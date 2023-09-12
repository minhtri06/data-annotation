import 'express-async-errors'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'

import { GeneralMiddleware } from './middlewares'
import envConfig from './configs/env-config'

const app = express()

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

// handle error
// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.use(GeneralMiddleware.handleNotFound)
app.use(GeneralMiddleware.handleException)

export default app

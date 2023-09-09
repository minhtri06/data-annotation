import Joi from 'joi'
import dotenv from 'dotenv'

dotenv.config()

interface IEnvSchema {
  NODE_ENV: 'dev' | 'test' | 'prod'
  PORT: number
  CLIENT_URL: string
  MONGODB_URL: string
  REDIS_URL: string
  REDIS_DEFAULT_EXPIRATION: number
  JWT_SECRET: string
  JWT_ACCESS_EXPIRATION_MINUTES: number
  JWT_REFRESH_EXPIRATION_DAYS: number
}

const envSchema = Joi.object<IEnvSchema, true>({
  NODE_ENV: Joi.string().valid('dev', 'test', 'prod').required(),
  PORT: Joi.number().integer().required(),
  CLIENT_URL: Joi.string().required(),
  MONGODB_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  REDIS_DEFAULT_EXPIRATION: Joi.number().integer().min(1),
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().integer().min(1),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().integer().min(1),
}).unknown()

const validation = envSchema.validate(process.env)
if (validation.error) {
  throw new Error('Config validation error: ' + validation.error.message)
}

const envConfig = validation.value
export default envConfig

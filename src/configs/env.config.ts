import Joi from 'joi'
import dotenv from 'dotenv'

dotenv.config()

interface IEnvSchema {
  NODE_ENV: 'dev' | 'test' | 'prod'
  PORT: number
  CLIENT_URL: string
  DEFAULT_PAGE_LIMIT: number
  MONGODB_URL: string
  REDIS_URL: string
  REDIS_DEFAULT_EXPIRATION: number
  RATE_LIMIT_PER_15_MINUTES: number
  JWT_SECRET: string
  JWT_ACCESS_EXPIRATION_MINUTES: number
  JWT_REFRESH_EXPIRATION_DAYS: number
  CLOUDINARY_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
}

const envSchema = Joi.object<IEnvSchema, true>({
  NODE_ENV: Joi.string().valid('dev', 'test', 'prod').required(),
  PORT: Joi.number().integer().required(),
  CLIENT_URL: Joi.string().required(),
  DEFAULT_PAGE_LIMIT: Joi.number().integer().min(1).required(),
  MONGODB_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  REDIS_DEFAULT_EXPIRATION: Joi.number().integer().min(1).required(),
  RATE_LIMIT_PER_15_MINUTES: Joi.number().integer().min(1).required(),
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().integer().min(1),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().integer().min(1),
  CLOUDINARY_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
}).unknown()

const validation = envSchema.validate(process.env)
if (validation.error) {
  throw new Error('Config validation error: ' + validation.error.message)
}

const ENV_CONFIG: Readonly<typeof validation.value> = validation.value
export default ENV_CONFIG

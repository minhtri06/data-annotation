import Joi from 'joi'
import dotenv from 'dotenv'

dotenv.config()

class EnvConfig {
  NODE_ENV!: 'dev' | 'test' | 'prod'
  PORT!: number
  CLIENT_URL!: string
  MONGODB_URL!: string
  JWT_SECRET!: string
  JWT_ACCESS_EXPIRATION_MINUTES!: number
  JWT_REFRESH_EXPIRATION_DAYS!: number

  constructor() {
    const envSchema = Joi.object<EnvConfig>({
      NODE_ENV: Joi.string().valid('dev', 'test', 'prod').required(),
      PORT: Joi.number().integer().required(),
      CLIENT_URL: Joi.string().required(),
      MONGODB_URL: Joi.string().required(),
      JWT_SECRET: Joi.string().required(),
      JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().integer().min(1),
      JWT_REFRESH_EXPIRATION_DAYS: Joi.number().integer().min(1),
    }).unknown()

    const validation = envSchema.validate(process.env)
    if (validation.error) {
      throw new Error('Config validation error: ' + validation.error.message)
    }

    Object.assign(this, validation.value)
  }
}

export default new EnvConfig()

import Joi from 'joi'
import dotenv from 'dotenv'

dotenv.config()

class EnvConfig {
  NODE_ENV: 'dev' | 'test' | 'prod'
  PORT: number
  CLIENT_URL: string

  MONGODB_URL: string

  constructor() {
    const envSchema = Joi.object<EnvConfig>({
      NODE_ENV: Joi.string().valid('dev', 'test', 'prod').required(),
      PORT: Joi.number().integer().required(),
      CLIENT_URL: Joi.string().required(),
      MONGODB_URL: Joi.string().required(),
    }).unknown()

    const validation = envSchema.validate(process.env)
    if (validation.error) {
      throw new Error('Config validation error: ' + validation.error.message)
    }

    const value = validation.value
    this.NODE_ENV = value.NODE_ENV
    this.PORT = value.PORT
    this.CLIENT_URL = value.CLIENT_URL
    this.MONGODB_URL = value.MONGODB_URL
  }
}

export default new EnvConfig()

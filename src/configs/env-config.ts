import Joi from 'joi'
import dotenv from 'dotenv'

dotenv.config()

class EnvConfig {
  NODE_ENV: 'dev' | 'test' | 'prod'
  MONGODB_URL: string
  PORT: number

  constructor() {
    const envSchema = Joi.object<EnvConfig>({
      NODE_ENV: Joi.string().valid('dev', 'test', 'prod').required(),
      MONGODB_URL: Joi.string().required(),
      PORT: Joi.number().integer().required(),
    }).unknown()

    const validation = envSchema.validate(process.env)
    if (validation.error) {
      throw new Error('Config validation error: ' + validation.error.message)
    }

    const value = validation.value
    this.MONGODB_URL = value.MONGODB_URL
    this.NODE_ENV = value.NODE_ENV
    this.PORT = value.PORT
  }
}

export default new EnvConfig()

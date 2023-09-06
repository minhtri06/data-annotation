import Joi from 'joi'

class EnvConfig {
  NODE_ENV: 'dev' | 'test' | 'prod'
  MONGODB_URL: string

  constructor() {
    const envSchema = Joi.object<EnvConfig>({
      NODE_ENV: Joi.string().valid('dev', 'test', 'prod'),
      MONGODB_URL: Joi.string().required(),
    }).unknown()

    const validation = envSchema.validate(process.env)
    if (validation.error) {
      throw new Error('Config validation error: ' + validation.error.message)
    }

    const value = validation.value
    this.MONGODB_URL = value.MONGODB_URL
    this.NODE_ENV = value.NODE_ENV
  }
}

export default new EnvConfig()

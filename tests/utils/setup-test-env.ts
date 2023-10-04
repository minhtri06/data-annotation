import ENV_CONFIG from '@src/configs/env.config'

export const setupTestEnv = () => {
  const ENV = { ...ENV_CONFIG }

  afterEach(() => {
    // restore env values
    Object.assign(ENV_CONFIG, ENV)
  })

  return ENV_CONFIG as { -readonly [key in keyof typeof ENV_CONFIG]: unknown }
}

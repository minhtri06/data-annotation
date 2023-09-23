import setup from './setup'

import envConfig from './configs/env.config'

const start = async () => {
  const app = await setup()

  app.listen(envConfig.PORT, () => {
    console.log('🍂 Server is running on port ' + envConfig.PORT)
  })
}

start().catch((error) => {
  console.log(error)
})

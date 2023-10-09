import './configs/module-alias.config'

import setup from './setup'
import ENV_CONFIG from './configs/env.config'
import { connectMongoDb, redisClient } from './helpers'

const start = async () => {
  try {
    // connect databases
    await connectMongoDb()
    console.log('🍃 Connect mongodb successfully')
    await redisClient.connect()
    console.log('🍃 Connect redis successfully')

    const app = setup()

    app.listen(ENV_CONFIG.PORT, () => {
      console.log('🍂 Server is running on port ' + ENV_CONFIG.PORT)
    })
  } catch (error) {
    console.log(error)
  }
}

void start()

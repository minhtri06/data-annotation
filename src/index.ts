import app from './app'

import { connectMongoDb, redisClient } from './helpers'
import envConfig from './configs/env-config'

const start = async () => {
  await connectMongoDb()
  console.log('🍃 Connect MongoDb successfully')

  await redisClient.connect()
  console.log('🍃 Connect Redis successfully')

  app.listen(envConfig.PORT, () => {
    console.log('🍂 Server is running on port ' + envConfig.PORT)
  })
}

start().catch((error) => console.log(error))

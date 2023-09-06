import express from 'express'

import router from './routes'
import envConfig from './configs/env-config'

const app = express()

// init middlewares

// init routes
app.use('/api/v1', router)

// handle error

app.listen(envConfig.PORT, () =>
  console.log('app is listening on port ' + envConfig.PORT),
)

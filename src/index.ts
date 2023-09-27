import './configs/module-alias.config'

import setup from './setup'
import envConfig from './configs/env.config'

const start = async () => {
  try {
    const app = await setup()

    app.listen(envConfig.PORT, () => {
      console.log('🍂 Server is running on port ' + envConfig.PORT)
    })
  } catch (error) {
    console.log(error)
  }
}

void start()

import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
const app = express()

app.listen(3000, () => console.log('app is listening on port 3000'))
console.log(process.env.MONGODB_URL)
console.log('adsf')

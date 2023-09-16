import 'reflect-metadata'
import mongoose from 'mongoose'
import { connectMongoDb } from './connect-mongodb'

import container from '../configs/inversify-config'
import { TYPES } from '../configs/constants'
import { IUserService } from '../services/interfaces'

const seedUser = async () => {
  const userService = container.get<IUserService>(TYPES.USER_SERVICE)

  await userService.createUser({
    name: 'Minh Tri',
    username: 'admin',
    password: 'password123',
    role: 'admin',
    birthOfDate: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await userService.createUser({
    name: 'Minh Tri',
    username: 'manager',
    password: 'password123',
    role: 'manager',
    birthOfDate: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await userService.createUser({
    name: 'Minh Tri',
    username: 'lv1annotator',
    password: 'password123',
    role: 'level-1-annotator',
    birthOfDate: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await userService.createUser({
    name: 'Minh Tri',
    username: 'lv2annotator',
    password: 'password123',
    role: 'level-2-annotator',
    birthOfDate: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
}

const seed = async () => {
  console.log('🍃 seed start')
  await connectMongoDb()
  await seedUser()
  await mongoose.disconnect()
  console.log('🍂 seed done')
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
seed()

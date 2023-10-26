import '@src/configs/module-alias.config'
import 'reflect-metadata'

import mongoose from 'mongoose'
import { connectMongoDb } from './mongo.db'

import container from '@src/configs/inversify.config'
import { IUserService } from '@src/services'
import { TYPES } from '@src/constants'

const seedUser = async () => {
  const userService = container.get<IUserService>(TYPES.USER_SERVICE)

  await userService.createUser({
    name: 'Minh Tri',
    username: 'admin',
    password: 'password123',
    role: 'admin',
    dateOfBirth: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await userService.createUser({
    name: 'Minh Tri',
    username: 'manager',
    password: 'password123',
    role: 'manager',
    dateOfBirth: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await userService.createUser({
    name: 'Minh Tri',
    username: 'annotator',
    password: 'password123',
    role: 'annotator',
    dateOfBirth: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await userService.createUser({
    name: 'Minh Tri',
    username: 'annotator2',
    password: 'password123',
    role: 'annotator',
    dateOfBirth: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
}

const seed = async () => {
  console.log('🍃 seed start')
  await connectMongoDb()
  await Promise.all(
    Object.values(mongoose.connection.collections).map(async (collection) =>
      collection.deleteMany(),
    ),
  )
  await seedUser()
  // await mongoose.disconnect()
  console.log('🍂 seed done')
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
seed()

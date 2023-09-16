import mongoose from 'mongoose'
import { User } from '../models'
import { connectMongoDb } from './connect-mongodb'

const seedUser = async () => {
  await User.create({
    name: 'Minh Tri',
    username: 'admin',
    password: 'password123',
    role: 'admin',
    birthOfDate: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await User.create({
    name: 'Minh Tri',
    username: 'manager',
    password: 'password123',
    role: 'manager',
    birthOfDate: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await User.create({
    name: 'Minh Tri',
    username: 'lv1annotator',
    password: 'password123',
    role: 'level-1-annotator',
    birthOfDate: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await User.create({
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

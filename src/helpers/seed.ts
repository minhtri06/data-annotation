import mongoose from 'mongoose'
import { User } from '../models'
import { connectMongoDb } from './connect-mongodb'

const seedUser = async () => {
  await User.create({
    name: 'Minh Tri',
    username: 'minhtri1',
    password: 'yolo123',
    role: 'level-1-annotator',
    birthOfDate: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await User.create({
    name: 'Minh Tri',
    username: 'minhtri2',
    password: 'yolo123',
    role: 'level-1-annotator',
    birthOfDate: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await User.create({
    name: 'Minh Tri',
    username: 'minhtri3',
    password: 'yolo123',
    role: 'level-1-annotator',
    birthOfDate: new Date(),
    phoneNumber: '0349123213',
    address: 'Hau Giang',
  })
  await User.create({
    name: 'Minh Tri',
    username: 'minhtri4',
    password: 'yolo123',
    role: 'level-1-annotator',
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

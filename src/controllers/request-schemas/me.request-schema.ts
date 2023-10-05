import { IUser } from '@src/models/interfaces'

export type UpdateMyProfile = {
  body: Pick<IUser, 'address' | 'birthOfDate' | 'name' | 'phoneNumber'>
}

import { IUser } from '@src/models'

export type UpdateMyProfile = {
  body: Pick<IUser, 'address' | 'dateOfBirth' | 'name' | 'phoneNumber'>
}

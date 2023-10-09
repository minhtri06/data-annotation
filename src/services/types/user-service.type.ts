import { IUser } from '@src/models/interfaces'

export type CreateUserPayload = Pick<
  IUser,
  'name' | 'username' | 'password' | 'role' | 'dateOfBirth' | 'phoneNumber' | 'address'
>

export type UpdateUserPayload = Partial<
  Pick<
    IUser,
    'address' | 'dateOfBirth' | 'name' | 'password' | 'phoneNumber' | 'workStatus'
  >
>

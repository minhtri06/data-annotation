import { IUser } from '@src/models/interfaces'

export type CreateUserPayload = Readonly<
  Pick<
    IUser,
    'name' | 'username' | 'password' | 'role' | 'dateOfBirth' | 'phoneNumber' | 'address'
  >
>

export type UpdateUserPayload = Readonly<
  Partial<
    Pick<
      IUser,
      'address' | 'dateOfBirth' | 'name' | 'password' | 'phoneNumber' | 'workStatus'
    >
  >
>

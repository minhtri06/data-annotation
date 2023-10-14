import { IRawUser } from '@src/models'

export type CreateUserPayload = Readonly<
  Pick<
    IRawUser,
    'name' | 'username' | 'password' | 'role' | 'dateOfBirth' | 'phoneNumber' | 'address'
  >
>

export type UpdateUserPayload = Readonly<
  Partial<
    Pick<
      IRawUser,
      'address' | 'dateOfBirth' | 'name' | 'password' | 'phoneNumber' | 'workStatus'
    >
  >
>

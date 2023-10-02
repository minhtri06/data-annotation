import * as userValidation from './user.validation'
import * as tokenValidation from './token.validation'

export const login = {
  username: userValidation.modelSchema.username.required(),
  password: userValidation.modelSchema.password.required(),
}

export const logout = {
  refreshToken: tokenValidation.modelSchema.body.required(),
}

export const refreshAuthTokens = {
  accessToken: tokenValidation.modelSchema.body.required(),
  refreshToken: tokenValidation.modelSchema.body.required(),
}

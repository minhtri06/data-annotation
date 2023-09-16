export const TYPES = {
  // models
  TOKEN_MODEL: Symbol('token-model'),
  USER_MODEL: Symbol('user-model'),
  // services
  AUTH_SERVICE: Symbol('auth-service'),
  TOKEN_SERVICE: Symbol('token-service'),
  USER_SERVICE: Symbol('user-service'),
  // middlewares
  GENERAL_MIDDLEWARE: Symbol('general-middleware'),
} as const

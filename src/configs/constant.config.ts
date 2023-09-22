export const TOKEN_TYPES = {
  ACCESS_TOKEN: 'access-token',
  REFRESH_TOKEN: 'refresh-token',
} as const

export const PROJECT_STATUS = {
  SETUP: 'setup',
  OPEN_FOR_JOINING: 'open-for-joining',
  ANNOTATING: 'annotating',
  DONE: 'done',
} as const

// inversify types
export const TYPES = {
  // models
  TOKEN_MODEL: Symbol('token-model'),
  USER_MODEL: Symbol('user-model'),
  // services
  AUTH_SERVICE: Symbol('auth-service'),
  IMAGE_STORAGE_SERVICE: Symbol('image-storage-service'),
  STORAGE_SERVICE_FACTORY: Symbol('storage-service-factory'),
  TOKEN_SERVICE: Symbol('token-service'),
  USER_SERVICE: Symbol('user-service'),
  // middlewares
  GENERAL_MIDDLEWARE: Symbol('general-middleware'),
  UPLOAD_MIDDLEWARE: Symbol('upload-middleware'),
} as const

export const TYPES = {
  // services
  AUTH_SERVICE: Symbol('auth-service'),
  IMAGE_STORAGE_SERVICE: Symbol('image-storage-service'),
  STORAGE_SERVICE_FACTORY: Symbol('storage-service-factory'),
  PROJECT_TYPE_SERVICE: Symbol('project-type-service'),
  PROJECT_SERVICE: Symbol('project-service'),
  TOKEN_SERVICE: Symbol('token-service'),
  USER_SERVICE: Symbol('user-service'),

  // middlewares
  GENERAL_MIDDLEWARE: Symbol('general-middleware'),
  UPLOAD_MIDDLEWARE: Symbol('upload-middleware'),
} as const

export const TYPES = {
  // models
  PROJECT_TYPE_MODEL: Symbol('project-type-model'),
  PROJECT_MODEL: Symbol('project-model'),
  SAMPLE_MODEL: Symbol('sample-model'),
  TOKEN_MODEL: Symbol('token-model'),
  USER_MODEL: Symbol('user-model'),

  // services
  AUTH_SERVICE: Symbol('auth-service'),
  IMAGE_STORAGE_SERVICE: Symbol('image-storage-service'),
  STORAGE_SERVICE_FACTORY: Symbol('storage-service-factory'),
  PROJECT_TYPE_SERVICE: Symbol('project-type-service'),
  PROJECT_SERVICE: Symbol('project-service'),
  SAMPLE_STORAGE_SERVICE: Symbol('sample-storage-service'),
  SAMPLE_SERVICE: Symbol('sample-service'),
  TOKEN_SERVICE: Symbol('token-service'),
  USER_SERVICE: Symbol('user-service'),

  // middlewares
  GENERAL_MIDDLEWARE: Symbol('general-middleware'),
  UPLOAD_MIDDLEWARE: Symbol('upload-middleware'),
  PROJECT_MIDDLEWARE: Symbol('project-middleware'),
} as const

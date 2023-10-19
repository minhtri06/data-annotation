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
  PROJECT_MIDDLEWARE: Symbol('project-middleware'),

  // models
  PROJECT_TYPE_MODEL: Symbol('project-type-model'),
  PROJECT_MODEL: Symbol('project-model'),
  SAMPLE_MODEL: Symbol('sample-model'),
  TOKEN_MODEL: Symbol('token-model'),
  USER_MODEL: Symbol('user-model'),

  // uploader
  IMAGE_UPLOADER: Symbol('image-uploader'),
  DATA_FILE_UPLOADER: Symbol('data-file-uploader'),
} as const

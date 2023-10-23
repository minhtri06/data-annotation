import 'reflect-metadata'
import { Container } from 'inversify'

import {
  IAuthService,
  IProjectService,
  IProjectTypeService,
  IImageStorageService,
  ITokenService,
  IUserService,
  AuthService,
  ImageStorageService,
  ProjectService,
  ProjectTypeService,
  TokenService,
  UserService,
  ISampleStorageService,
  SampleStorageService,
  ISampleService,
  SampleService,
} from '@src/services'
import {
  GeneralMiddleware,
  IGeneralMiddleware,
  IUploadMiddleware,
  UploadMiddleware,
} from '@src/middlewares'
import {
  authControllerFactory,
  meControllerFactory,
  projectControllerFactory,
  projectTypeControllerFactory,
  userControllerFactory,
} from '@src/controllers'
import { TYPES } from '@src/constants'
import {
  IProjectModel,
  IProjectTypeModel,
  ISampleModel,
  ITokenModel,
  IUserModel,
  Project,
  ProjectType,
  Sample,
  Token,
  User,
} from '@src/models'
import {
  IProjectMiddleware,
  ProjectMiddleware,
} from '@src/middlewares/project.middleware'

const container = new Container()

// bind models
container.bind<IProjectTypeModel>(TYPES.PROJECT_TYPE_MODEL).toConstantValue(ProjectType)
container.bind<IProjectModel>(TYPES.PROJECT_MODEL).toConstantValue(Project)
container.bind<ISampleModel>(TYPES.SAMPLE_MODEL).toConstantValue(Sample)
container.bind<ITokenModel>(TYPES.TOKEN_MODEL).toConstantValue(Token)
container.bind<IUserModel>(TYPES.USER_MODEL).toConstantValue(User)

// bind services
container.bind<IAuthService>(TYPES.AUTH_SERVICE).to(AuthService)
container
  .bind<IImageStorageService>(TYPES.IMAGE_STORAGE_SERVICE)
  .toConstantValue(new ImageStorageService())
container.bind<IProjectTypeService>(TYPES.PROJECT_TYPE_SERVICE).to(ProjectTypeService)
container.bind<IProjectService>(TYPES.PROJECT_SERVICE).to(ProjectService)
container
  .bind<ISampleStorageService>(TYPES.SAMPLE_STORAGE_SERVICE)
  .to(SampleStorageService)
container.bind<ISampleService>(TYPES.SAMPLE_SERVICE).to(SampleService)
container.bind<ITokenService>(TYPES.TOKEN_SERVICE).to(TokenService)
container.bind<IUserService>(TYPES.USER_SERVICE).to(UserService)

// bind middlewares
container.bind<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE).to(GeneralMiddleware)
container.bind<IUploadMiddleware>(TYPES.UPLOAD_MIDDLEWARE).to(UploadMiddleware)
container.bind<IProjectMiddleware>(TYPES.PROJECT_MIDDLEWARE).to(ProjectMiddleware)

// register controllers
authControllerFactory(container)
meControllerFactory(container)
projectTypeControllerFactory(container)
projectControllerFactory(container)
userControllerFactory(container)

export default container

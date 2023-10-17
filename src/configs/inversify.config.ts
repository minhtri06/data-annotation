import 'reflect-metadata'
import { Container, interfaces } from 'inversify'

import {
  IAuthService,
  IProjectService,
  IProjectTypeService,
  IStorageService,
  ITokenService,
  IUserService,
  AuthService,
  ImageStorageService,
  ProjectService,
  ProjectTypeService,
  TokenService,
  UserService,
} from '../services'
import {
  GeneralMiddleware,
  IGeneralMiddleware,
  IUploadMiddleware,
  UploadMiddleware,
} from '../middlewares'
import {
  authControllerFactory,
  meControllerFactory,
  projectControllerFactory,
  projectTypeControllerFactory,
  userControllerFactory,
} from '../controllers'
import { TYPES } from '../constants'
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

const container = new Container()

// bind services
container.bind<IAuthService>(TYPES.AUTH_SERVICE).to(AuthService)
container
  .bind<IStorageService>(TYPES.IMAGE_STORAGE_SERVICE)
  .toConstantValue(new ImageStorageService())
container
  .bind<interfaces.Factory<IStorageService>>(TYPES.STORAGE_SERVICE_FACTORY)
  .toFactory<IStorageService, ['image']>((context) => {
    return (fileType) => {
      if (fileType === 'image') {
        return context.container.get<IStorageService>(TYPES.IMAGE_STORAGE_SERVICE)
      } else {
        throw new Error('storage not implemented')
      }
    }
  })
container.bind<IProjectTypeService>(TYPES.PROJECT_TYPE_SERVICE).to(ProjectTypeService)
container.bind<IProjectService>(TYPES.PROJECT_SERVICE).to(ProjectService)
container.bind<ITokenService>(TYPES.TOKEN_SERVICE).to(TokenService)
container.bind<IUserService>(TYPES.USER_SERVICE).to(UserService)

// bind middlewares
container.bind<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE).to(GeneralMiddleware)
container.bind<IUploadMiddleware>(TYPES.UPLOAD_MIDDLEWARE).to(UploadMiddleware)

// bind models
container.bind<IProjectTypeModel>(TYPES.PROJECT_TYPE_MODEL).toConstantValue(ProjectType)
container.bind<IProjectModel>(TYPES.PROJECT_MODEL).toConstantValue(Project)
container.bind<ISampleModel>(TYPES.SAMPLE_MODEL).toConstantValue(Sample)
container.bind<ITokenModel>(TYPES.TOKEN_MODEL).toConstantValue(Token)
container.bind<IUserModel>(TYPES.USER_MODEL).toConstantValue(User)

// register controllers
authControllerFactory(container)
meControllerFactory(container)
projectTypeControllerFactory(container)
projectControllerFactory(container)
userControllerFactory(container)

export default container

import { Container, interfaces } from 'inversify'

import {
  IAuthService,
  IStorageService,
  ITokenService,
  IUserService,
} from '../services/interfaces'
import { AuthService, ImageStorageService, TokenService, UserService } from '../services'
import { GeneralMiddleware, IGeneralMiddleware } from '../middlewares'
import {
  authControllerFactory,
  meControllerFactory,
  userControllerFactory,
} from '../controllers'
import { IUploadMiddleware, UploadMiddleware } from '../middlewares/upload.middleware'
import { TYPES } from './constants'

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
container.bind<ITokenService>(TYPES.TOKEN_SERVICE).to(TokenService)
container.bind<IUserService>(TYPES.USER_SERVICE).to(UserService)

// bind middlewares
container.bind<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE).to(GeneralMiddleware)
container.bind<IUploadMiddleware>(TYPES.UPLOAD_MIDDLEWARE).to(UploadMiddleware)

// register controllers
authControllerFactory(container)
userControllerFactory(container)
meControllerFactory(container)

export default container

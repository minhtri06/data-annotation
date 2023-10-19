export interface IStorageService {
  deleteFile(filename: string): Promise<void>

  checkExist(filename: string): Promise<boolean>
}

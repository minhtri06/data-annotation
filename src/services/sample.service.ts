import { inject, injectable } from 'inversify'
import { ISampleService } from './sample.service.interface'
import { PROJECT_STATUS, TYPES } from '@src/constants'
import { IProjectModel, ISampleModel } from '@src/models'
import { NotAllowedException, NotfoundException } from './exceptions'
import { ISampleStorageService } from './sample-storage.service.interface'

@injectable()
export class SampleService implements ISampleService {
  constructor(
    @inject(TYPES.SAMPLE_MODEL) private Sample: ISampleModel,
    @inject(TYPES.PROJECT_MODEL) private Project: IProjectModel,
    @inject(TYPES.SAMPLE_STORAGE_SERVICE)
    private sampleStorageService: ISampleStorageService,
  ) {}

  async getSamplesOfProject(
    filter: { projectId: string },
    options: { skip?: number; page?: number; limit?: number },
  ) {
    return await this.Sample.paginate(filter, options)
  }

  async addSamplesFromFile(projectId: string, filename: string) {
    const project = await this.Project.findById(projectId)
    if (!project) {
      throw new NotfoundException('Project not found')
    }
    if (project.status !== PROJECT_STATUS.SETTING_UP) {
      throw new NotAllowedException(`Cannot add samples to ${project.status} project`)
    }
    this.sampleStorageService.streamSample({
      filename,
      maxLinePerBatch: 3,
      process: async (batch: string[][]) => {
        await Promise.all(
          batch.map((texts) => this.Sample.create({ texts, project: projectId })),
        )
        await project.updateOne({ $inc: { numberOfSamples: batch.length } })
      },
      final: async () => {
        await this.sampleStorageService.deleteFile(filename)
      },
    })
  }
}

import { inject, injectable } from 'inversify'
import { AddSamplesPayloads, ISampleService } from './sample.service.interface'
import { PROJECT_STATUS, TYPES } from '@src/constants'
import { IProjectModel, ISampleModel, SampleDocument } from '@src/models'
import { NotAllowedException, NotfoundException } from './exceptions'

@injectable()
export class SampleService implements ISampleService {
  constructor(
    @inject(TYPES.SAMPLE_MODEL) private Sample: ISampleModel,
    @inject(TYPES.PROJECT_MODEL) private Project: IProjectModel,
  ) {}

  async addSample(
    projectId: string,
    payloads: AddSamplesPayloads,
  ): Promise<SampleDocument[]> {
    const project = await this.Project.findById(projectId)
    if (!project) {
      throw new NotfoundException('Project not found')
    }
    if (project.status !== PROJECT_STATUS.SETTING_UP) {
      throw new NotAllowedException(`Cannot add samples to ${project.status} project`)
    }
    const samples = await Promise.all(
      payloads.map((payload) => this.Sample.create(payload)),
    )
    return samples
  }
}

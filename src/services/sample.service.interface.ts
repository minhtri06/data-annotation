import { SampleDocument } from '@src/models'
import { PaginateResult } from '@src/types'

export interface ISampleService {
  getSamplesOfProject(
    filter: { projectId: string },
    options: { skip?: number; page?: number; limit?: number },
  ): Promise<PaginateResult<SampleDocument>>

  addSamplesFromFile(projectId: string, filename: string): Promise<void>
}

import { IRawSample, SampleDocument } from '@src/models'

export interface ISampleService {
  addSample(projectId: string, payload: AddSamplesPayloads): Promise<SampleDocument[]>
}

export type AddSamplesPayloads = Readonly<Pick<IRawSample, 'texts'>>[]

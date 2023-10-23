import { IRawSample, ProjectDocument, SampleDocument } from '@src/models'
import { PaginateResult } from '@src/types'

export interface ISampleService {
  getSampleById(sampleId: string): Promise<SampleDocument | null>

  getProjectSamples(
    project: ProjectDocument,
    options: GetProjectSamplesOptions,
  ): Promise<PaginateResult<SampleDocument>>

  getDivisionSamples(
    project: ProjectDocument,
    division: ProjectDocument['taskDivisions'][number],
    options: GetDivisionSamples,
  ): Promise<PaginateResult<SampleDocument>>

  uploadSamplesToProject(project: ProjectDocument, filename: string): Promise<void>

  insertSampleToProject(
    project: ProjectDocument,
    texts: string[],
  ): Promise<SampleDocument>

  annotateSample(
    project: ProjectDocument,
    sample: SampleDocument,
    annotation: AnnotateSampleAnnotation,
  ): Promise<void>
}

export type GetProjectSamplesOptions = Readonly<{
  page?: number
  limit?: number
  checkPaginate?: boolean
}>

export type GetDivisionSamples = Readonly<{
  limit?: number
  page?: number
  checkPaginate?: boolean
}>

export type AnnotateSampleAnnotation = Readonly<
  Pick<IRawSample, 'labelings' | 'generatedTexts' | 'textAnnotations'>
>

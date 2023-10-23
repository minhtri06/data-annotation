import { inject, injectable } from 'inversify'
import {
  AnnotateSampleAnnotation,
  GetDivisionSamples,
  GetProjectSamplesOptions,
  ISampleService,
} from './sample.service.interface'
import { PROJECT_PHASES, SAMPLE_STATUSES, TYPES } from '@src/constants'
import {
  IProjectModel,
  IRawSample,
  ISample,
  ISampleModel,
  ProjectDocument,
  SampleDocument,
} from '@src/models'
import { ISampleStorageService } from './sample-storage.service.interface'
import { NotAllowedException, ValidationException } from './exceptions'

@injectable()
export class SampleService implements ISampleService {
  constructor(
    @inject(TYPES.SAMPLE_MODEL) private Sample: ISampleModel,
    @inject(TYPES.PROJECT_MODEL) private Project: IProjectModel,
    @inject(TYPES.SAMPLE_STORAGE_SERVICE)
    private sampleStorageService: ISampleStorageService,
  ) {}

  async getSampleById(sampleId: string) {
    return await this.Sample.findById(sampleId)
  }

  async getProjectSamples(project: ProjectDocument, options: GetProjectSamplesOptions) {
    return await this.Sample.paginate({ project: project._id }, options)
  }

  async getDivisionSamples(
    project: ProjectDocument,
    division: ProjectDocument['taskDivisions'][number],
    options: GetDivisionSamples,
  ) {
    if (!division.startSample || !division.endSample) {
      throw new NotAllowedException('Division has not been established')
    }
    return await this.Sample.paginate(
      {
        project: project._id,
        number: { $gt: division.startSample - 1, $lt: division.endSample + 1 },
      },
      options,
    )
  }

  async uploadSamplesToProject(
    project: ProjectDocument,
    filename: string,
  ): Promise<void> {
    if (project.phase !== PROJECT_PHASES.SETTING_UP) {
      await this.sampleStorageService.deleteFile(filename)
      throw new NotAllowedException(`Cannot add samples to ${project.phase} project`)
    }

    const numberOfSamplesBeforeInsert = project.numberOfSamples
    let number = numberOfSamplesBeforeInsert

    this.sampleStorageService.streamSample({
      filename,
      maxLinePerBatch: 3,
      process: async (batch: string[][]) => {
        await Promise.all(
          batch.map((texts) => {
            number++
            return this.Sample.create({
              texts,
              project: project._id,
              number,
            })
          }),
        )
        project.numberOfSamples += batch.length
        await project.save()
      },
      final: async () => {
        await this.sampleStorageService.deleteFile(filename)
      },
    })
  }

  async insertSampleToProject(project: ProjectDocument, texts: string[]) {
    if (project.phase !== PROJECT_PHASES.SETTING_UP) {
      throw new NotAllowedException("Project's phase is not setting up")
    }
    const number = project.numberOfSamples + 1
    const sample = await this.Sample.create({
      texts,
      project: project._id,
      number,
    })
    project.numberOfSamples++
    await project.save()
    return sample
  }

  private validateLabelSets(
    hasLabelSets: boolean,
    labelSetConfigs: { isMultiSelected: boolean; labels: string[] }[],
    labelings: string[][] | null,
  ) {
    const annotated = !!labelings
    if (!hasLabelSets) {
      if (annotated) {
        throw new ValidationException('Labelings is not allowed')
      }
    } else {
      if (!annotated) {
        throw new ValidationException('Labelings is required')
      }

      if (labelSetConfigs.length !== labelings.length) {
        throw new ValidationException(
          `Required exact ${labelSetConfigs.length} label sets`,
        )
      }
      for (let i = 0; i < labelSetConfigs.length; i++) {
        if (!labelSetConfigs[i].isMultiSelected && labelings[i].length > 1) {
          throw new ValidationException(`LabelSets[${i}] does not allow multi selection`)
        }

        for (const selectedLabel of labelings[i]) {
          if (!labelSetConfigs[i].labels.includes(selectedLabel)) {
            throw new ValidationException(
              `Label '${selectedLabel}' is not allowed in LabelSets[${i}]`,
            )
          }
        }
      }
    }
  }

  private validateGeneratedTexts(
    hasGeneratedTexts: boolean,
    generatedTexts: string[] | null,
  ) {
    const annotated = !!generatedTexts
    if (hasGeneratedTexts) {
      if (!annotated) {
        throw new ValidationException('Generated texts is required')
      }
      if (generatedTexts.length === 0) {
        throw new ValidationException('generatedTexts is not allowed to be empty')
      }
    }
    if (!hasGeneratedTexts && annotated) {
      throw new ValidationException('Generated texts is not allowed')
    }
  }

  private validateInlineLabels(
    hasInlineLabels: boolean,
    allowedLabels: string[],
    inlineLabelings: IRawSample['textAnnotations'][number]['inlineLabelings'],
  ) {
    const annotated = !!inlineLabelings
    if (!hasInlineLabels) {
      if (annotated) {
        throw new ValidationException('Inline labels is not allowed')
      }
    } else {
      if (!annotated) {
        throw new ValidationException('Inline label is required')
      }

      for (const labeling of inlineLabelings) {
        if (!allowedLabels.includes(labeling.label)) {
          throw new ValidationException(
            `Label ${labeling.label} is not allowed in inline label`,
          )
        }
      }
    }
  }

  async annotateSample(
    project: ProjectDocument,
    sample: SampleDocument,
    annotation: AnnotateSampleAnnotation,
  ) {
    if (project.phase !== PROJECT_PHASES.ANNOTATING) {
      throw new NotAllowedException('Project is not in annotating phase')
    }
    const annotationConfig = project.annotationConfig

    this.validateLabelSets(
      annotationConfig.hasLabelSets,
      annotationConfig.labelSets,
      annotation.labelings,
    )

    this.validateGeneratedTexts(
      annotationConfig.hasGeneratedTexts,
      annotation.generatedTexts,
    )

    const textConfigs = annotationConfig.textConfigs
    const textAnnotations = annotation.textAnnotations
    for (let i = 0; i < sample.texts.length; i++) {
      if (!textConfigs[i]) {
        if (textAnnotations[i]) {
          throw new ValidationException(`texts[${i}] does not allow annotation`)
        }
        break
      }
      if (!textAnnotations[i]) {
        throw new ValidationException(`Text #${i} require annotation`)
      }
      this.validateLabelSets(
        textConfigs[i].hasLabelSets,
        textConfigs[i].labelSets,
        textAnnotations[i].labelings,
      )

      this.validateInlineLabels(
        textConfigs[i].hasInlineLabels,
        textConfigs[i].inlineLabels,
        textAnnotations[i].inlineLabelings,
      )
    }

    sample.labelings = annotation.labelings as ISample['labelings']
    sample.generatedTexts = annotation.generatedTexts as ISample['generatedTexts']
    sample.textAnnotations = annotation.textAnnotations as ISample['textAnnotations']
    sample.status = SAMPLE_STATUSES.ANNOTATED

    await sample.save()
  }
}

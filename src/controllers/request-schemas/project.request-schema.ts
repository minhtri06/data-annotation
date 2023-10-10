export type CreateProject = {
  body: {
    name: string

    projectType: string

    requirement: string

    description?: string

    maximumOfAnnotators: number

    annotationConfig: {
      hasLabelSets: boolean
      labelSets: {
        isMultiSelected: boolean
        labels: string[]
      }[]

      hasGeneratedTexts: boolean

      individualTextConfigs: {
        hasLabelSets: boolean
        labelSets: {
          isMultiSelected: boolean
          labels: string[]
        }[]

        hasInlineLabels: boolean
        inlineLabels: string[]
      }[]
    }
  }
}

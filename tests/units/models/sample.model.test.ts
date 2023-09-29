import { SAMPLE_STATUS } from '@src/configs/constants'
import { Sample } from '@src/models'
import { ISample } from '@src/models/interfaces'
import { generateSample, generateSampleComments } from '@tests/fixtures/sample.fixtures'

let rawSample: Partial<ISample>
beforeEach(() => {
  rawSample = generateSample()
})

describe('Sample model', () => {
  describe('Sample validation', () => {
    test('should correctly validate a valid sample', async () => {
      await expect(new Sample(rawSample).validate()).resolves.toBeUndefined()
    })

    test('should throw an error if sample has 0 texts', async () => {
      rawSample.texts = []
      await expect(new Sample(rawSample).validate()).rejects.toThrow()
    })

    test("should throw an error if a newly created sample has a status other than 'new'", async () => {
      rawSample.status = SAMPLE_STATUS.ANNOTATED
      await expect(new Sample(rawSample).validate()).rejects.toThrow()
    })

    test('should throw an error if a newly created sample has annotation field', async () => {
      rawSample.annotation = {
        labelSets: [{ selectedLabels: ['dog'] }],
        generatedTexts: null,
        singleTextAnnotation: [],
      }
      await expect(new Sample(rawSample).validate()).rejects.toThrow()
    })

    test('should throw an error if a newly created sample has comments field', async () => {
      rawSample.comments = generateSampleComments(4)
      await expect(new Sample(rawSample).validate()).rejects.toThrow()
    })
  })
})

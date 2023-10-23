import { SAMPLE_STATUSES } from '@src/constants'
import { Sample } from '@src/models'
import { IRawSample } from '@src/models'
import { generateSample, generateSampleComments } from '@tests/fixtures/sample.fixtures'

let rawSample: Partial<IRawSample>
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
      rawSample.status = SAMPLE_STATUSES.ANNOTATED
      await expect(new Sample(rawSample).validate()).rejects.toThrow()
    })

    test('should throw an error if a newly created sample has annotation fields', async () => {
      rawSample = generateSample({ labelings: [['dogs']] })
      await expect(new Sample(rawSample).validate()).rejects.toThrow()

      rawSample = generateSample({ generatedTexts: ['Hi, how are you?'] })
      await expect(new Sample(rawSample).validate()).rejects.toThrow()

      rawSample = generateSample({
        textAnnotations: [{ labelings: [['dogs']], inlineLabelings: [] }],
      })
      await expect(new Sample(rawSample).validate()).rejects.toThrow()

      rawSample = generateSample({
        textAnnotations: [
          { labelings: null, inlineLabelings: [{ startAt: 0, endAt: 1, label: 'dogs' }] },
        ],
      })
      await expect(new Sample(rawSample).validate()).rejects.toThrow()
    })

    test('should throw an error if a newly created sample has comments field', async () => {
      rawSample.comments = generateSampleComments(4)
      await expect(new Sample(rawSample).validate()).rejects.toThrow()
    })
  })
})

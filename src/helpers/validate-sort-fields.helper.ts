import { ValidationException } from '@src/services/exceptions'

export const validateSortFields = (sortOption: string, allowedFields: string[]) => {
  for (const fieldOrder of sortOption.split(' ')) {
    const field = fieldOrder[0] === '-' ? fieldOrder.slice(1) : fieldOrder
    if (!allowedFields.includes(field)) {
      throw new ValidationException(`'${field}' is not allowed`)
    }
  }
}

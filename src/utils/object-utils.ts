export const isEmptyObject = (obj: object) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

export const getObjectKeys = <T extends { [key: string]: unknown }>(
  obj: T,
): (keyof T)[] => Object.keys(obj)

export const pickFields = <T extends { [key: string]: unknown }>(
  obj: T,
  ...keys: (keyof T)[]
) => {
  const newObj: T = {} as T
  for (const key of keys) {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key]
    }
  }
  return newObj
}

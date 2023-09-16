export const isEmptyObject = (obj: object) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

export const getObjectKeys = <T extends { [key: string]: unknown }>(
  obj: T,
): (keyof T)[] => Object.keys(obj)

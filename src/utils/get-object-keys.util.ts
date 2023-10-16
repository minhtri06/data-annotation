export const getObjectKeys = <T extends { [key: string]: unknown }>(
  obj: T,
): (keyof T)[] => Object.keys(obj)

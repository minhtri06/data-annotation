export const omitFields = <T extends object, P extends [...(keyof T)[]]>(
  obj: T,
  ...props: P
): Omit<T, P[number]> => {
  const ret = {} as T
  let prop: keyof typeof obj
  for (prop of Object.getOwnPropertyNames(obj) as (keyof typeof obj)[]) {
    if (!props.includes(prop)) {
      ret[prop] = obj[prop]
    }
  }
  return ret
}

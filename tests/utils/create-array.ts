export const createArray = <T>(createItem: () => T, length: number) => {
  const array: T[] = []
  for (let i = 0; i < length; i++) {
    array.push(createItem())
  }
}

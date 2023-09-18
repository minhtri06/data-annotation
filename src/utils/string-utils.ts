/** e.g. "goToTheMoon" => "Go to the moon" */
export const camelCaseToNormalText = (str: string) => {
  const temp = str.replace(/([A-Z])/g, (match) => ` ${match.toLowerCase()}`)
  return temp[0].toUpperCase() + temp.slice(1)
}

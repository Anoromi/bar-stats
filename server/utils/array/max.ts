

export function max<T>(array: T[], compare: (value: T, to: T) => number) {
  if(array.length === 0)
    return null
  let max = array[0]
  for(const v of array) {
    if(compare(v, max) > 0)
      max = v
  }
  return max
}

export function min<T>(array: T[], compare: (value: T, to: T) => number) {
  if(array.length === 0)
    return null
  let max = array[0]
  for(const v of array) {
    if(compare(v, max) < 0)
      max = v
  }
  return max
}

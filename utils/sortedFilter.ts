import { wait } from "./wait"


export function sortedFilter<T>(data: T[], lowerBoundCompare: (value: T) => number, upperBoundCompare: (value: T) => number) {
  let minBound : number, maxBound: number
  let waitTicker = 0
  {
    let min = 0, max = data.length
    while (min < max) {
      let med = Math.floor((min + max) / 2)
      let value = data[med]
      console.log(value, med)
      const comparisonResult = lowerBoundCompare(value)
      if (comparisonResult < 0) {
        min = med + 1
      }
      else if (comparisonResult >= 0) {
        max = med
      }
    }
    minBound = min

    waitTicker++;
    //if (waitTicker % 10 === 0) {
    //  await wait(100)
    //}

  }
  {
    let min = 0, max = data.length
    while (min < max) {
      let med = Math.floor((min + max) / 2)
      let value = data[med]
      const comparisonResult = lowerBoundCompare(value)
      console.log(value, med)
      if (comparisonResult <= 0) {
        min = med + 1
      }
      else if (comparisonResult > 0) {
        max = med
      }
    }
    maxBound = max

    waitTicker++;
    //if (waitTicker % 10 === 0) {
    //  await wait(100)
    //}
  }

  return data.slice(minBound, maxBound)
}


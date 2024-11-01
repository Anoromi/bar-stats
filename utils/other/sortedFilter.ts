import { crashInterrupted } from "../worker/core/crash";
import type { ExecutionContext } from "../worker/core/server";

export async function sortedFilter<T>(
  data: T[],
  lowerBoundCompare: (value: T) => number,
  upperBoundCompare: (value: T) => number,
  options :
  {
    context: ExecutionContext
  }
) {
  let minBound: number, maxBound: number;
  let waitTicker = 0;
  {
    let min = 0,
      max = data.length;
    while (min < max) {
      const med = Math.floor((min + max) / 2);
      const value = data[med];
      //console.log(value, med);
      const comparisonResult = lowerBoundCompare(value);
      if (comparisonResult < 0) {
        min = med + 1;
      } else if (comparisonResult >= 0) {
        max = med;
      }
    }
    minBound = min;

    waitTicker++;
    //if (waitTicker % 10 === 0) {
    //  await wait(100)
    //}
  }
  await crashInterrupted(options.context.check())
  {
    let min = 0,
      max = data.length;
    while (min < max) {
      const med = Math.floor((min + max) / 2);
      const value = data[med];
      const comparisonResult = lowerBoundCompare(value);
      //console.log(value, med);
      if (comparisonResult <= 0) {
        min = med + 1;
      } else if (comparisonResult > 0) {
        max = med;
      }
    }
    maxBound = max;

    waitTicker++;
    //if (waitTicker % 10 === 0) {
    //  await wait(100)
    //}
  }

  return data.slice(minBound, maxBound);
}

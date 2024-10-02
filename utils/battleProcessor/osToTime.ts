export function calculateAvgOsToTime(
  battles: BattleWithPlayers[],
  meanSize: number = 100
): [os: number, time: number][] {
  const sortedBattles = battles.sort((a, b) => {
    return (a.key.averageOs ?? 0) - (b.key.averageOs ?? 0);
  });

  const osArr: number[] = [];
  const timeArr: number[] = [];

  for (let i = 0; i < sortedBattles.length; i++) {
    const value = sortedBattles[i];
    if (value.key.averageOs !== null) {
      osArr.push(value.key.averageOs);
      timeArr.push(value.key.durationMs / 1000 / 60);
    }
  }

  console.log("sorted battles", osArr, timeArr);

  const smoothedTimeArr = movingMean(timeArr, meanSize);

  console.log("smoothed", smoothedTimeArr);

  const results: [number, number][] = [];

  let lastOs: number | null = null;
  let lastTimeSum: number | null = null;
  let lastTimeCount: number | null = null;
  for (let i = 0; i < osArr.length; i++) {
    const os = osArr[i];
    const smoothedTime = smoothedTimeArr[i];
    if (lastOs !== null && os === lastOs) {
      lastTimeSum! += smoothedTime;
      lastTimeCount! += 1;
      continue;
    } else if (lastOs !== null) {
      results.push([lastOs, lastTimeSum! / lastTimeCount!]);
    }

    lastOs = os;
    lastTimeSum = smoothedTime;
    lastTimeCount = 1;
  }
  return results;
}

function movingMean(values: number[], meanSize = 100) {
  if (meanSize === 0 || meanSize % 2 === 0) meanSize++;

  let i = 0;

  let sum = 0;

  for (let i = 0; i < meanSize / 2; i++) {
    sum += values[i];
  }
  const smoothedValues: number[] = [];

  for (; i < meanSize / 2 + 1; i++) {
    console.log("sum, size", sum, meanSize / 2 + i + 1);
    const lastValueIndex = Math.floor(meanSize / 2) + i + 1
    sum += values[lastValueIndex];
    smoothedValues.push(sum / lastValueIndex);
  }

  for (; i < values.length - meanSize / 2; i++) {
    sum -= values[i - Math.floor(meanSize / 2) - 1];
    sum += values[i + Math.floor(meanSize / 2)];
    smoothedValues.push(sum / meanSize);
  }
  for (; i < values.length; i++) {
    sum -= values[i - Math.floor(meanSize / 2) - 1];
    smoothedValues.push(sum / (Math.floor(meanSize / 2) + (values.length - i - 1) + 1));
  }

  return smoothedValues;
}

import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import { FixedRingBuffer } from "../other/ringBuffer";
import type { MovingAverageOptions } from "~/rstar/pkg/bar_stats_wasm";

export type ValueToTimeMapping = {
    values: Float64Array;
    times: Float64Array;
}

export function calculateAvgOsToTime(
  battles: BattleWithPlayers[],
): ValueToTimeMapping {
  return calculateParamToTime(
    battles,
    (battle) => battle.key.averageOs!,
    (battle) => battle.key.durationMs / 1000 / 60,
  );
}

function minDiff(battles: BattleWithPlayers) {
  let minSkill = battles.values[0].skill!;
  let maxSkill = battles.values[0].skill!;
  for (let i = 1; i < battles.values.length; i++) {
    const playerSkill = battles.values[i].skill!;
    if (playerSkill > maxSkill!) {
      maxSkill = playerSkill;
    }
    if (playerSkill < minSkill!) {
      minSkill = playerSkill;
    }
  }
  return maxSkill - minSkill;
}

export function calculateOsDiffToTime(
  battles: BattleWithPlayers[],
): ValueToTimeMapping {
  return calculateParamToTime(
    battles,
    minDiff,
    (v) => v.key.durationMs / 1000 / 60,
  );
}

export function calculateMinOsToTime(
  battles: BattleWithPlayers[],
): ValueToTimeMapping{
  return calculateParamToTime(
    battles,
    (v) => {
      return Math.min(
        ...v.values
          .map((player) => player.skill)
          .filter((skill) => skill !== null),
      );
    },
    (battle) => battle.key.durationMs / 1000 / 60,
  );
}

export function calculateMaxOsToTime(
  battles: BattleWithPlayers[],
): ValueToTimeMapping {
  return calculateParamToTime(
    battles,
    (v) => {
      return Math.max(
        ...v.values
          .map((player) => player.skill)
          .filter((skill) => skill !== null),
      );
    },
    (battle) => battle.key.durationMs / 1000 / 60,
  );
}

export function calculateParamToTime<T>(
  values: T[],
  extractValue: (a: T) => number | null,
  extractTime: (a: T) => number,
): ValueToTimeMapping{
  const sortedBattles = [...values].sort((a, b) => {
    const va = extractValue(a);
    const vb = extractValue(b);
    if (va === null && vb === null) return 0;
    if (va === null) return -1;
    if (vb === null) return 1;
    return va - vb;
  });

  const valueArr = new Float64Array(sortedBattles.length);
  const timeArr = new Float64Array(sortedBattles.length);
  for (let i = 0; i < sortedBattles.length; i++) {
    const v = extractValue(sortedBattles[i]);
    if (v === null) {
      continue;
    }
    valueArr[i] = v;
    timeArr[i] = extractTime(sortedBattles[i]);
  }

  return {
    values: valueArr,
    times: timeArr
  };
}

export async function smoothValues(
  valueArr: Float64Array,
  timeArr: Float64Array,
  meanSize: number,
  smoothingOption: MovingAverageOptions,
) {
  const { moving_average } = await import("~/rstar/pkg/bar_stats_wasm");
  const smoothedTimeArr = moving_average(timeArr, meanSize, smoothingOption);
  //const smoothedTimeArr = movingMedian(timeArr, meanSize);
  //console.log("smoothed", smoothedTimeArr);
  //console.log("osArr", valueArr);

  const results: [number, number][] = [];

  let lastOs: number | null = null;
  let lastTimeSum: number | null = null;
  let lastTimeCount: number | null = null;
  for (let i = 0; i < valueArr.length; i++) {
    //console.log(i)
    const os = valueArr[i];
    const smoothedTime = smoothedTimeArr[i];
    if (lastOs !== null && os === lastOs) {
      //console.log('adding', os, lastOs)
      lastTimeSum! += smoothedTime;
      lastTimeCount! += 1;
      continue;
    }
    if (lastOs !== null) {
      results.push([lastOs, lastTimeSum! / lastTimeCount!]);
    }

    lastOs = os;
    lastTimeSum = smoothedTime;
    lastTimeCount = 1;
  }
  return results;
}

export function movingMean(values: number[], meanSize = 100) {
  meanSize = Math.floor(meanSize);
  if (meanSize % 2 === 0) meanSize++;

  let i = 0;

  let sum = 0;

  for (let i = 0; i < Math.floor(meanSize / 2); i++) {
    sum += values[i];
  }
  const smoothedValues: number[] = [];
  console.log("initial sum", sum);

  for (; i < Math.floor(meanSize / 2) + 1; i++) {
    const lastValueIndex = Math.floor(meanSize / 2) + i;
    console.log("lastValueIndex", lastValueIndex);
    sum += values[lastValueIndex];
    smoothedValues.push(sum / (lastValueIndex + 1));
    console.log("index", i);
    console.log("sum", sum);
  }

  for (; i < values.length - meanSize / 2; i++) {
    //console.log('i', i)
    //console.log('sum', sum)
    //console.log('left right', i - Math.floor(meanSize / 2) - 1, i + Math.floor(meanSize / 2))
    sum -= values[i - Math.floor(meanSize / 2) - 1];
    sum += values[i + Math.floor(meanSize / 2)];
    smoothedValues.push(sum / meanSize);
  }
  for (; i < values.length; i++) {
    sum -= values[i - Math.floor(meanSize / 2) - 1];
    smoothedValues.push(
      sum / (Math.floor(meanSize / 2) + (values.length - i - 1) + 1),
    );
  }

  return smoothedValues;
}

export function movingMedian(values: number[], medianSize = 100) {
  medianSize = Math.floor(medianSize);
  if (medianSize % 2 === 0) medianSize++;

  let i = 0;

  const valueBuffer: FixedRingBuffer<number> = new FixedRingBuffer(medianSize);

  for (let i = 0; i < Math.floor(medianSize / 2); i++) {
    valueBuffer.push(values[i]);
  }
  const smoothedValues: number[] = [];

  for (; i < Math.floor(medianSize / 2) + 1; i++) {
    const lastValueIndex = Math.floor(medianSize / 2) + i;
    valueBuffer.push(values[lastValueIndex]);

    const arr = [...valueBuffer.values()].sort((a, b) => a - b);
    console.log("arr", arr);
    smoothedValues.push(sortedArrayMedian(arr));
  }

  for (; i < values.length - medianSize / 2; i++) {
    valueBuffer.pop();
    valueBuffer.push(values[i + Math.floor(medianSize / 2)]);
    const arr = [...valueBuffer.values()].sort((a, b) => a - b);
    smoothedValues.push(sortedArrayMedian(arr));
  }
  for (; i < values.length; i++) {
    valueBuffer.pop();
    const arr = [...valueBuffer.values()].sort((a, b) => a - b);
    smoothedValues.push(sortedArrayMedian(arr));
  }

  return smoothedValues;
}

function sortedArrayMedian(values: number[]) {
  const valueA = values[Math.floor(values.length / 2)];
  if (values.length % 2 === 0) {
    const valueB = values[Math.floor(values.length / 2) - 1];
    return (valueA + valueB) / 2;
  } else {
    return valueA;
  }
}

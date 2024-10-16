import type { BattleWithPlayers } from "~/server/utils/services/battleService";

export function calculateAvgOsToTime(
  battles: BattleWithPlayers[],
  meanSize: number = 100,
): [os: number, time: number][] {
  return calculateParamToTime(battles, meanSize, (v) => v.key.averageOs!);
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
  //console.log('skill diff', battles, maxSkill, minSkill)
  return maxSkill - minSkill;
}

export function calculateOsDiffToTime(
  battles: BattleWithPlayers[],
  meanSize: number = 100,
): [os: number, time: number][] {
  return calculateParamToTime(battles, meanSize, minDiff);
}

function calculateParamToTime(
  battles: BattleWithPlayers[],
  meanSize: number = 100,
  extractValue: (a: BattleWithPlayers) => number | null,
) {
  const sortedBattles = battles.sort((a, b) => {
    const va = extractValue(a);
    const vb = extractValue(b);
    if (va === null && vb === null) return 0;
    if (va === null) return -1;
    if (vb === null) return 1;
    return va - vb;
  });

  const osArr: number[] = [];
  const timeArr: number[] = [];

  for (let i = 0; i < sortedBattles.length; i++) {
    const battle = sortedBattles[i];
    const value = extractValue(battle);
    if (value !== null) {
      osArr.push(value);
      timeArr.push(battle.key.durationMs / 1000 / 60);
    }
  }

  console.log(sortedBattles);
  console.log(timeArr);

  const smoothedTimeArr = movingMean(timeArr, meanSize);
  console.log('smoothed', smoothedTimeArr);
  console.log('osArr', osArr);

  const results: [number, number][] = [];

  let lastOs: number | null = null;
  let lastTimeSum: number | null = null;
  let lastTimeCount: number | null = null;
  for (let i = 0; i < osArr.length; i++) {
    //console.log(i)
    const os = osArr[i];
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
  console.log('results', results)
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
    const lastValueIndex = Math.floor(meanSize / 2) + i + 1;
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
    smoothedValues.push(
      sum / (Math.floor(meanSize / 2) + (values.length - i - 1) + 1),
    );
  }

  return smoothedValues;
}

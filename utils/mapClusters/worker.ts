import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import { WorkerServer } from "../worker/core/server";
import { count } from "../other/count";
import { assert } from "../other/assert";
import type { LabeledPlayer } from "../battleProcessor/labeledPlayers";
import {
  calculateParamToTime,
  type ValueToTimeMapping,
  type ValueToTimeMappingWithExtra,
} from "../battleProcessor/osToTime";
import { sumArray } from "../other/sumArray";

let battles: BattleWithPlayers[] | null = null;
let playerBattles: number[] | null = null;
let playerIndexes: number[] | null = null;
let clusterLabels: number[] | null = null;
let labelCount: number | null = null;
let teamCount: number | null = null;

function getPlayerBattle(index: number) {
  return battles![playerBattles![index]];
}

function getPlayer(index: number) {
  return getPlayerBattle(index).values[playerIndexes![index]];
}

async function processRequest(searchedLabels: number[]): Promise<{
  pointCount: number;
  positionPreference: number;
  factionPreference: Record<string, number>;
  factionWinrate: Record<string, number>;
  osToTime: {
    data: ValueToTimeMapping;
    teamWins: ValueToTimeMapping[];
  };
  osAvgOsDiffToTime: {
    data: ValueToTimeMapping;
    teamWins: ValueToTimeMapping[];
  };
  osTeamToTime: {
    data: ValueToTimeMapping;
    teamWins: ValueToTimeMapping[];
  };
  osTeamAvgOsDiffToTime: {
    data: ValueToTimeMapping;
    teamWins: ValueToTimeMapping[];
  };
} | null> {
  assert(battles !== null);
  assert(playerBattles !== null);
  assert(playerIndexes !== null);
  assert(clusterLabels !== null);
  assert(labelCount !== null);
  if (searchedLabels.length === 0) return null;

  return {
    pointCount: count(clusterLabels, (_v, i) => {
      return searchedLabels.includes(clusterLabels![i]);
    }),
    positionPreference: calculatePositionPreference(searchedLabels),
    factionPreference: calculateFactionPreference(searchedLabels),
    factionWinrate: calculateFactionWinrate(searchedLabels),
    osToTime: calculateOsToTime(searchedLabels),
    osAvgOsDiffToTime: calculateOsAvgDifferenceToTime(searchedLabels),
    osTeamToTime: calculateOsTeamToTime(searchedLabels),
    osTeamAvgOsDiffToTime: calculateOsTeamAvgDifferenceToTime(searchedLabels),
  };
}

function calculatePositionPreference(searchedLabels: number[]) {
  let avg = 0;
  let count = 0;

  for (let i = 0; i < clusterLabels!.length; i++) {
    const label = clusterLabels![i];
    if (!searchedLabels.includes(label)) continue;

    const battle = getPlayerBattle(i);
    const player = getPlayer(i);

    if (player.skill === null) continue;

    const sortedPlayers = Array(...battle.values)
      .filter((v) => v.battleTeamNumber === player.battleTeamNumber)
      .sort((a, b) => (a.skill ?? 0) - (b.skill ?? 0));

    const position = sortedPlayers.findIndex((v) => v === player);
    if (position >= sortedPlayers.length / 2)
      avg += position - sortedPlayers.length / 2 + 1;
    else if (position < Math.floor(sortedPlayers.length / 2))
      avg -= sortedPlayers.length / 2 - position;

    count++;
  }
  if (count === 0) return 0;
  return avg / count;
}

function calculateFactionPreference(searchedLabels: number[]) {
  const count: Record<string, number> = {};

  for (let i = 0; i < clusterLabels!.length; i++) {
    const label = clusterLabels![i];
    if (!searchedLabels.includes(label)) continue;

    const player = getPlayer(i);

    if (player.faction === null) continue;

    count[player.faction] ??= 0;

    count[player.faction]++;
  }
  return count;
}

function calculateFactionWinrate(searchedLabels: number[]) {
  const wins: Record<string, { wins: number; count: number }> = {};

  for (let i = 0; i < clusterLabels!.length; i++) {
    const label = clusterLabels![i];
    if (!searchedLabels.includes(label)) continue;

    const battle = getPlayerBattle(i);
    const player = getPlayer(i);

    if (player.faction === null) continue;

    wins[player.faction] ??= { wins: 0, count: 0 };

    const value = wins[player.faction];
    if (player.battleTeamNumber === battle.key.winningTeam) {
      value.wins++;
    }
    value.count++;
  }

  const results: Record<string, number> = {};
  for (const key of Object.keys(wins)) {
    if (wins[key].count === 0) {
      results[key] = wins[key].wins / wins[key].count;
    } else {
      results[key] = wins[key].wins / wins[key].count;
    }
  }
  console.log("faction winrate results", wins, results);
  return results;
}

function calculateOsToTime(searchedLabels: number[]): {
  data: ValueToTimeMapping;
  teamWins: ValueToTimeMapping[];
} {
  const filteredBattles = battlesWithLabelIndexes(searchedLabels);
  const sortedOs = calculateParamToTime(
    filteredBattles,
    ({ playerIndexes }) => {
      return sumArray(playerIndexes.map((v) => getPlayer(v).skill ?? 0));
    },
    ({ battle }) => {
      return battle.key.durationMs / 1000 / 60;
    },
    ({ battle }) => {
      return battle.key.winningTeam!;
    },
  );

  return {
    data: {
      values: sortedOs.values,
      times: sortedOs.times,
    },
    teamWins: groupByTeamWin(sortedOs),
  };
}

function calculateOsTeamToTime(searchedLabels: number[]): {
  data: ValueToTimeMapping;
  teamWins: ValueToTimeMapping[];
} {
  const filteredBattles = battlesWithLabelIndexes(searchedLabels);
  const sortedOs = calculateParamToTime(
    filteredBattles,
    ({ playerIndexes }) => {
      const blueTeamSum = sumArray(
        playerIndexes.map((v) => {
          const player = getPlayer(v);
          if (player.battleTeamNumber === 0) {
            return player.skill ?? 0;
          } else {
            return 0;
          }
        }),
      );
      const redTeamSum = sumArray(
        playerIndexes.map((v) => {
          const player = getPlayer(v);
          if (player.battleTeamNumber === 1) {
            return player.skill ?? 0;
          } else {
            return 0;
          }
        }),
      );
      return blueTeamSum - redTeamSum;
    },
    ({ battle }) => {
      return battle.key.durationMs / 1000 / 60;
    },
    ({ battle }) => {
      return battle.key.winningTeam!;
    },
  );

  return {
    data: {
      values: sortedOs.values,
      times: sortedOs.times,
    },
    teamWins: groupByTeamWin(sortedOs),
  };
}

function calculateOsAvgDifferenceToTime(searchedLabels: number[]): {
  data: ValueToTimeMapping;
  teamWins: ValueToTimeMapping[];
} {
  const filteredBattles = battlesWithLabelIndexes(searchedLabels);
  const sortedOs = calculateParamToTime(
    filteredBattles,
    ({ battle, playerIndexes }) => {
      return sumArray(
        playerIndexes.map(
          (v) => (getPlayer(v).skill ?? 0) - (battle.key.averageOs ?? 0),
        ),
      );
    },
    ({ battle }) => {
      return battle.key.durationMs / 1000 / 60;
    },
    ({ battle }) => {
      return battle.key.winningTeam!;
    },
  );

  return {
    data: {
      values: sortedOs.values,
      times: sortedOs.times,
    },
    teamWins: groupByTeamWin(sortedOs),
  };
}

function calculateOsTeamAvgDifferenceToTime(searchedLabels: number[]): {
  data: ValueToTimeMapping;
  teamWins: ValueToTimeMapping[];
} {
  const filteredBattles = battlesWithLabelIndexes(searchedLabels);
  const sortedOs = calculateParamToTime(
    filteredBattles,
    ({ battle, playerIndexes }) => {
      const team0Sum = sumArray(
        playerIndexes.map((v) => {
          const player = getPlayer(v);
          if (player.battleTeamNumber === 0)
            return (player.skill ?? 0) - (battle.key.averageOs ?? 0);
          else return 0;
        }),
      );
      const team1Sum = sumArray(
        playerIndexes.map((v) => {
          const player = getPlayer(v);
          if (player.battleTeamNumber === 1)
            return (player.skill ?? 0) - (battle.key.averageOs ?? 0);
          else return 0;
        }),
      );
      return team0Sum - team1Sum;
    },
    ({ battle }) => {
      return battle.key.durationMs / 1000 / 60;
    },
    ({ battle }) => {
      return battle.key.winningTeam!;
    },
  );

  return {
    data: {
      values: sortedOs.values,
      times: sortedOs.times,
    },
    teamWins: groupByTeamWin(sortedOs),
  };
}

function battlesWithLabelIndexes(searchedLabels: number[]) {
  const battlesToIndexes = new Map<BattleWithPlayers, number[]>();

  for (let i = 0; i < clusterLabels!.length; i++) {
    const label = clusterLabels![i];
    if (!searchedLabels.includes(label)) continue;

    const battle = getPlayerBattle(i);
    const indexList = battlesToIndexes.get(battle);
    if (indexList === undefined) {
      battlesToIndexes.set(battle, [i]);
    } else {
      if (!indexList.includes(i)) {
        indexList.push(i);
      }
    }
  }

  return battlesToIndexes
    .entries()
    .filter((v) => v[1].length === searchedLabels.length)
    .map((v) => ({ battle: v[0], playerIndexes: v[1] }))
    .toArray();
}

function groupByTeamWin({
  times,
  values,
  extra,
}: ValueToTimeMappingWithExtra<number>): ValueToTimeMapping[] {
  const teamWinGroups = Array(teamCount!)
    .fill(0)
    .map(
      (_) =>
        ({
          values: [],
          times: [],
        }) as { values: number[]; times: number[] },
    );
  for (let i = 0; i < extra.length; i++) {
    const teamWins = teamWinGroups[extra[i]];
    teamWins.values.push(values[i]);
    teamWins.times.push(times[i]);
  }
  return teamWinGroups.map((v) => ({
    values: Float64Array.from(v.values),
    times: Float64Array.from(v.times),
  }));
}

export type ClusterPostprocessingRequest =
  | {
    type: "init";
    params: {
      battles: BattleWithPlayers[];
      labeledPlayers: LabeledPlayer[];
      labelCount: number;
      teamCount: number;
    };
  }
  | {
    type: "evaluate";
    params: {
      labels: number[];
    };
  };

export type ClusterPostprocessingResult =
  | {
    type: "init";
  }
  | {
    type: "evaluate";
    data: {
      pointCount: number;
      positionPreference: number;
      factionPreference: Record<string, number>;
      factionWinrate: Record<string, number>;
      osToTime: {
        data: ValueToTimeMapping;
        teamWins: ValueToTimeMapping[];
      };
      osAvgOsDiffToTime: {
        data: ValueToTimeMapping;
        teamWins: ValueToTimeMapping[];
      };
      osTeamToTime: {
        data: ValueToTimeMapping;
        teamWins: ValueToTimeMapping[];
      };
      osTeamAvgOsDiffToTime: {
        data: ValueToTimeMapping;
        teamWins: ValueToTimeMapping[];
      };
    } | null;
  };

onmessage = new WorkerServer<
  ClusterPostprocessingRequest,
  ClusterPostprocessingResult
>(async (_, data) => {
  switch (data.type) {
    case "init": {
      const { params } = data;
      battles = params.battles;
      playerBattles = params.labeledPlayers.map((v) => v[1]);
      playerIndexes = params.labeledPlayers.map((v) => v[0]);
      clusterLabels = params.labeledPlayers.map((v) => v[2]);
      labelCount = params.labelCount;
      teamCount = params.teamCount;
      return {
        type: "init",
      };
    }
    case "evaluate":
      return {
        type: "evaluate",
        data: await processRequest(data.params.labels),
      };
  }
}).listener;

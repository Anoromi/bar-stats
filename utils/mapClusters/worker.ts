import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import { WorkerServer } from "../worker/core/server";
import { count } from "../other/count";
import { assert } from "../other/assert";
import type { LabeledPlayer } from "../battleProcessor/labeledPlayers";
import { calculateParamToTime } from "../battleProcessor/osToTime";
import { sumArray } from "../other/sumArray";

let battles: BattleWithPlayers[] | null = null;
let playerBattles: number[] | null = null;
let playerIndexes: number[] | null = null;
let clusterLabels: number[] | null = null;
let labelCount: number | null = null;

function getPlayerBattle(index: number) {
  return battles![playerBattles![index]];
}

function getPlayer(index: number) {
  return getPlayerBattle(index).values[playerIndexes![index]];
}

function processRequest(searchedLabels: number[]): {
  pointCount: number;
  //positionImportance: number;
  positionPreference: number;
  factionPreference: Record<string, number>;
  factionWinrate: Record<string, number>;
  osToTime: [number, number][];
  osAvgOsDiffToTime: [number, number][];
} {
  assert(battles !== null);
  assert(playerBattles !== null);
  assert(playerIndexes !== null);
  assert(clusterLabels !== null);
  assert(labelCount !== null);
  if (searchedLabels.length === 0)
    return {
      pointCount: 0,
      positionPreference: 0,
      factionPreference: {},
      factionWinrate: {},
      osToTime: [],
      osAvgOsDiffToTime: [],
    };

  return {
    pointCount: count(clusterLabels, (_v, i) => {
      return searchedLabels.includes(clusterLabels![i]);
    }),
    positionPreference: calculatePreference(searchedLabels),
    factionPreference: calculateFactionPreference(searchedLabels),
    factionWinrate: calculateFactionWinrate(searchedLabels),
    osToTime: calculateOsToTime(searchedLabels),
    osAvgOsDiffToTime: calculateOsAvgDifferenceToTime(searchedLabels),
  };
}

function calculatePreference(searchedLabels: number[]) {
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

    const position = sortedPlayers.findIndex((v) => v == player);
    if (position >= sortedPlayers.length / 2)
      avg += position - sortedPlayers.length / 2 + 1;
    else if (position < sortedPlayers.length / 2)
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
  console.log('faction winrate results', wins, results)
  return results;
}

function calculateOsToTime(searchedLabels: number[]) {
  const filteredBattles = battlesWithLabelIndexes(searchedLabels);
  return calculateParamToTime(
    filteredBattles,
    filteredBattles.length / 20,
    ({ playerIndexes }) => {
      return sumArray(playerIndexes.map((v) => getPlayer(v).skill ?? 0));
    },
    ({ battle }) => {
      return battle.key.durationMs / 1000 / 60;
    },
  );
}

function calculateOsAvgDifferenceToTime(searchedLabels: number[]) {
  const filteredBattles = battlesWithLabelIndexes(searchedLabels);
  return calculateParamToTime(
    filteredBattles,
    filteredBattles.length / 20,
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
  );
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

export type ClusterPostprocessingRequest =
  | {
      type: "init";
      params: {
        battles: BattleWithPlayers[] | null;
        labeledPlayers: LabeledPlayer[];
        labelCount: number | null;
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
        //posi/tionImportance: number;
        positionPreference: number;
        factionPreference: Record<string, number>;
        factionWinrate: Record<string, number>;
        osToTime: [number, number][];
        osAvgOsDiffToTime: [number, number][];
        //preferenceToTime: [number, number][];
      };
    };

onmessage = new WorkerServer<
  ClusterPostprocessingRequest,
  ClusterPostprocessingResult
>(async (_, data) => {
  switch (data.type) {
    case "init":
      battles = data.params.battles;
      playerBattles = data.params.labeledPlayers.map((v) => v[1]);
      playerIndexes = data.params.labeledPlayers.map((v) => v[0]);
      clusterLabels = data.params.labeledPlayers.map((v) => v[2]);
      labelCount = data.params.labelCount;
      return {
        type: "init",
      };
    case "evaluate":
      return {
        type: "evaluate",
        data: processRequest(data.params.labels),
      };
  }
}).listener;

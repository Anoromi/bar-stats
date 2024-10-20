import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import { WorkerServer } from "../worker/core/server";
import { count } from "../other/count";
import { assert } from "../other/assert";
import type { LabeledPlayer } from "../battleProcessor/labeledPlayers";

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
  //factionPreference: Record<string, string>;
  //factionWinrate: Record<string, string>;
  //preferenceToTime: [number, number][];
} {
  assert(battles !== null);
  assert(playerBattles !== null);
  assert(playerIndexes !== null);
  assert(clusterLabels !== null);
  assert(labelCount !== null);

  return {
    pointCount: count(clusterLabels, (_v, i) => {
      return searchedLabels.includes(clusterLabels![i]);
    }),
    positionPreference: calculatePreference(searchedLabels)
  };
}

function calculatePreference(searchedLabels: number[]) {
  let avg = 0;
  let count = 0;

  for(let i = 0; i < clusterLabels!.length; i++) {
    const label = clusterLabels![i]
    if(!searchedLabels.includes(label))
      continue;
    
    const battle = getPlayerBattle(i);
    const player = getPlayer(i);

    if(player.skill === null)
      continue;

    avg+= player.skill - battle.key.averageOs!;
    count++;
  }
  return avg / count;
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
        //factionPreference: Record<string, string>;
        //factionWinrate: Record<string, string>;
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

import { WorkerServer } from "../worker/core/server";
import {
  calculateAvgOsToTime,
  calculateMaxOsToTime,
  calculateMinOsToTime,
  calculateOsDiffToTime,
  type ValueToTimeMapping,
} from "./osToTime";
import type { MapDto } from "~/server/utils/dto/dto";
import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import { normalizeBattleTeamBoxes } from "./mainTeamBoxes";
import { getMap } from "./map";
import type { MapEntity } from "~/server/utils/database/schema";
import { calculateWinrateOfFactions } from "./factionWinrate";
import { calculateTeamWinrate } from "./teamWinrate";
import { clusterizePlayers } from "./clusterizePlayers";
import type { LabeledPlayer } from "./labeledPlayers";
import { max } from "../other/max";
import { getBattles, type GetBattlesClientParams } from "./getBattles";

async function processBattleRequest(params: GetBattlesClientParams): Promise<{
  battles: BattleWithPlayers[];
  factionWinrate: Record<string, number>;
  teamWinrate?: Record<number, number>;
  clusteredData?: LabeledPlayer[];
  map?: MapEntity;
  clusterCount?: number;
  osToTime: ValueToTimeMapping;
  minOs: ValueToTimeMapping;
  maxOs: ValueToTimeMapping;
  osDiffToTime: ValueToTimeMapping;
  maxTeamCount: number;
}> {
  const battles = await getBattles(params);
  console.log("received", battles);
  console.log(
    "received",
    battles.map((v) => v.key.id),
  );

  if (battles.length === 0) {
    return {
      osToTime: { times: new Float64Array(), values: new Float64Array() },
      minOs: { times: new Float64Array(), values: new Float64Array() },
      maxOs: { times: new Float64Array(), values: new Float64Array() },
      osDiffToTime: { times: new Float64Array(), values: new Float64Array() },
      battles: [],
      map: undefined,
      maxTeamCount: 0,
      factionWinrate: {},
    };
  }

  let filteredBattles = battles;
  if (params.map !== null) {
    filteredBattles = normalizeBattleTeamBoxes(filteredBattles);
  }

  return {
    battles: filteredBattles,
    ...(await genericProcess(filteredBattles)),
    ...(params.map !== null ? await processSpecificMap(filteredBattles) : {}),
    maxTeamCount: calculateTeamCount(battles),
  };
}

function calculateTeamCount(battles: BattleWithPlayers[]): number {
  let foundMax = 0;
  for (let i = 0; i < battles.length; i++) {
    const battle = battles[i];
    const next =
      max(battle.teams, (a, b) => a.teamNumber - b.teamNumber)!.teamNumber + 1;
    if (next > foundMax) foundMax = next;
  }
  return foundMax;
}

async function genericProcess(battles: BattleWithPlayers[]): Promise<{
  factionWinrate: Record<string, number>;
  osToTime: ValueToTimeMapping;
  osDiffToTime: ValueToTimeMapping;
  minOs: ValueToTimeMapping;
  maxOs: ValueToTimeMapping;
}> {
  return {
    factionWinrate: calculateWinrateOfFactions(battles),
    osToTime: calculateAvgOsToTime(battles),
    osDiffToTime: calculateOsDiffToTime(battles),
    minOs: calculateMinOsToTime(battles),
    maxOs: calculateMaxOsToTime(battles),
  };
}

async function processSpecificMap(battles: BattleWithPlayers[]): Promise<{
  teamWinrate: Record<number, number>;
  labeledPlayers: LabeledPlayer[];
  map?: MapDto;
  clusterCount?: number;
}> {
  const map = await getMap(battles[0].key.mapId);
  const { labeledPlayers, clusterCount } = await clusterizePlayers(
    battles,
    map,
  );
  return {
    teamWinrate: calculateTeamWinrate(battles),
    labeledPlayers,
    map,
    clusterCount,
  };
}

export type BattlesProcessorRequest = {
  type: "battle";
  params: GetBattlesClientParams;
};

export type BattlesProcessorResponse = {
  type: "battle";
  data: {
    battles: BattleWithPlayers[];
    factionWinrate: Record<string, number>;
    teamWinrate?: Record<number, number>;
    labeledPlayers?: LabeledPlayer[];
    map?: MapEntity;
    clusterCount?: number;
    osToTime: ValueToTimeMapping;
    minOs: ValueToTimeMapping;
    maxOs: ValueToTimeMapping;
    osDiffToTime: ValueToTimeMapping;
    maxTeamCount: number;
  };
};

const server = new WorkerServer<
  BattlesProcessorRequest,
  BattlesProcessorResponse
>(async (_, data) => {
  switch (data.type) {
    case "battle":
      return {
        type: "battle",
        data: await processBattleRequest(data.params),
      };
  }
});

onmessage = server.listener;

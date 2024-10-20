import type { GetBattleQuery } from "~/server/api/battle";
import { WorkerServer } from "../worker/core/server";
import { calculateAvgOsToTime, calculateOsDiffToTime } from "./osToTime";
import type { MapDto } from "~/server/utils/dto/dto";
import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import { normalizeBattleTeamBoxes } from "./mainTeamBoxes";
import { generateParams } from "./generateParams";
import { getMap } from "./map";
import type { MapEntity } from "~/server/utils/database/schema";
import { calculateWinrateOfFactions } from "./factionWinrate";
import { calculateTeamWinrate } from "./teamWinrate";
import { clusterizePlayers } from "./clusterizePlayers";
import type { LabeledPlayer } from "./labeledPlayers";
import { max } from "../other/max";

async function processBattleRequest(params: GetBattleQuery): Promise<{
  battles: BattleWithPlayers[];
  factionWinrate: Record<string, number>;
  teamWinrate?: Record<number, number>;
  clusteredData?: LabeledPlayer[];
  map?: MapEntity;
  clusterCount?: number;
  osToTime: [os: number, time: number][];
  osToTime2: [os: number, time: number][];
  osToTime3: [os: number, time: number][];
  osDiffToTime: [os: number, time: number][];
  maxTeamCount: number;
}> {
  const battles = await fetch(
    "/api/battle?" +
      new URLSearchParams(
        generateParams<GetBattleQuery>(
          ["map", params.map],
          ["limit", params.limit?.toString()],
          ["users", params.users?.map((v) => v.toString())],
          ["battleType", params.battleType],
        ),
      ),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  ).then(async (v) => (await v.json()) as BattleWithPlayers[]);
  console.log("received", battles);
  console.log(
    "received",
    battles.map((v) => v.key.id),
  );

  let filteredBattles = battles;
  if (params.map !== null) {
    filteredBattles = normalizeBattleTeamBoxes(filteredBattles);
  }

  return {
    battles: filteredBattles,
    ...genericProcess(filteredBattles),
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

function genericProcess(battles: BattleWithPlayers[]): {
  factionWinrate: Record<string, number>;
  osToTime: [os: number, time: number][];
  osToTime2: [os: number, time: number][];
  osToTime3: [os: number, time: number][];
  osDiffToTime: [os: number, time: number][];
} {
  return {
    factionWinrate: calculateWinrateOfFactions(battles),
    osToTime: calculateAvgOsToTime(battles, battles.length / 20),
    osToTime2: calculateAvgOsToTime(battles, battles.length / 10),
    osToTime3: calculateAvgOsToTime(battles, battles.length / 5),
    osDiffToTime: calculateOsDiffToTime(battles, battles.length / 10),
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
  params: GetBattleQuery;
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
    osToTime: [os: number, time: number][];
    osToTime2: [os: number, time: number][];
    osToTime3: [os: number, time: number][];
    osDiffToTime: [os: number, time: number][];
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

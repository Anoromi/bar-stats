import type { GetBattleQuery } from "~/server/api/battle";
import { WorkerServer } from "../worker/core/server";
import { calculateAvgOsToTime, calculateOsDiffToTime } from "./osToTime";
import { depthClusterize } from "./clusterize";
import type {
  MapDto,
  ProcessingUser,
  UserToBattleTeamDto,
} from "~/server/utils/dto/dto";
import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import { normalizeBattleTeamBoxes } from "./mainTeamBoxes";
import { generateParams } from "./generateParams";
import { getMap } from "./map";
import type { MapEntity } from "~/server/utils/database/schema";
import { assert } from "../other/assert";
import { calculateWinrateOfFactions } from "./factionWinrate";
import { calculateTeamWinrate } from "./teamWinrate";

async function processBattleRequest(params: GetBattleQuery) {
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

  return {
    ...genericProcess(battles),
    ...(params.map !== null ? await processSpecificMap(battles) : {}),
  };
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

async function cluster(battles: BattleWithPlayers[], map: MapDto) {
  const players: {
    player: ProcessingUser;
    battleIndex: number;
  }[] = [];
  for (let i = 0; i < battles.length; i++) {
    const battle = battles[i];
    for (let j = 0; j < battle.values.length; j++) {
      const player = battle.values[j];
      const playerTeam = battle.teams.find(
        (v) => v.teamNumber === player.battleTeamNumber,
      );
      assert(playerTeam !== undefined, "Couldn't find a team for player");
      const translatedLeft = (playerTeam.left! * map.width! * 1000) / 2 - 50;
      const translatedRight = (playerTeam.right! * map.width! * 1000) / 2 + 50;
      const translatedTop = (playerTeam.top! * map.height! * 1000) / 2 - 50;
      const translatedBottom =
        (playerTeam.bottom! * map.height! * 1000) / 2 + 50;

      if (
        player.startPosX !== null &&
        player.startPosZ !== null &&
        player.startPosX >= translatedLeft &&
        player.startPosX <= translatedRight &&
        player.startPosZ <= translatedBottom &&
        player.startPosZ >= translatedTop
      )
        players.push({
          player,
          battleIndex: i,
        });
    }
  }

  //battles.flatMap((v) => v.values);
  console.time("clusterize");
  const { data: clusterLabels, clusterCount } = await depthClusterize(
    players,
    (player) => ({
      x: player.player.startPosX!,
      y: player.player.startPosZ!,
      battleIndex: player.battleIndex,
    }),
    //distFunction,
    600,
    20,
  );
  console.timeEnd("clusterize");

  const clusteredData = clusterLabels.map(
    (v, i) => [players[i].player, v] as [UserToBattleTeamDto, number],
  );

  //console.log(clusteredData.filter((v) => v === undefined));
  //agglomerativeClusterize(
  //  clusteredData,
  //  clusterCount + 1,
  //  singleLinkCloseness,
  //  distFunction,
  //  100,
  //);
  return {
    clusteredData: clusteredData, //.filter((v) => v[1] !== 0),
    clusterCount,
  };
}

async function processSpecificMap(battles: BattleWithPlayers[]): Promise<{
  teamWinrate: Record<number, number>;
  clusteredData?: [UserToBattleTeamDto, number][];
  map?: MapDto;
  clusterCount?: number;
}> {
  const map = await getMap(battles[0].key.mapId);
  const filteredBattles = normalizeBattleTeamBoxes(battles);
  const { clusteredData, clusterCount } = await cluster(filteredBattles, map);
  return {
    teamWinrate: calculateTeamWinrate(filteredBattles),
    //clusteredData: players.map(v => [v, 0] as [UserToBattleTeamDto, number]),
    clusteredData: clusteredData,
    map,
    clusterCount: clusterCount,
  };
}

export type BattlesProcessorRequest = {
  type: "battle";
  params: GetBattleQuery;
};

export type BattlesProcessorResponse = {
  type: "battle";
  data: {
    factionWinrate: Record<string, number>;
    teamWinrate?: Record<number, number>;
    clusteredData?: [UserToBattleTeamDto, number][];
    map?: MapEntity;
    clusterCount?: number;
    osToTime: [os: number, time: number][];
    osToTime2: [os: number, time: number][];
    osToTime3: [os: number, time: number][];
    osDiffToTime: [os: number, time: number][];
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

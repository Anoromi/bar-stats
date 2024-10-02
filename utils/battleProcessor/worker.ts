import type { GetBattleQuery } from "~/server/api/battle";
import { WorkerServer } from "../worker/core/server";
import { calculateAvgOsToTime } from "./osToTime";

console.log("I'm running something");

function generateParams<T>(
  ...values: [keyof T, string | unknown | null | undefined][]
): Record<keyof T, string> {
  const result = {} as Record<keyof T, string>;
  for (const [key, value] of values) {
    if (value !== undefined && value !== null) result[key] = String(value);
  }
  return result;
}

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
    ...(params.map === null ? processAnyMaps(battles) : []),
    ...(params.map !== null ? processSpecificMap(battles) : []),
  };
}

function genericProcess(battles: BattleWithPlayers[]) {
  return {
    factionWinrate: calculateWinrateOfFactions(battles),
    osToTime: calculateAvgOsToTime(battles, battles.length / 20),
    osToTime2: calculateAvgOsToTime(battles, battles.length / 10),
    osToTime3: calculateAvgOsToTime(battles, battles.length / 5),
  };
}

function processAnyMaps(battles: BattleWithPlayers[]) {
  return {};
}

function processSpecificMap(battles: BattleWithPlayers[]) {
  return {
    teamWinrate: calculateTeamWinrate(battles),
  };
}

function calculateTeamWinrate(battles: BattleWithPlayers[]) {
  const teamWins: Record<number, number> = {};

  for (const battle of battles) {
    const winningTeam = battle.key.winningTeam;
    if (winningTeam === null) continue;
    teamWins[winningTeam] ??= 0;
    teamWins[winningTeam]++;
  }

  const teamWinrate: Record<number, number> = {};
  for (const key in teamWins) {
    teamWinrate[key] = teamWins[key] / battles.length;
  }
  return teamWinrate;
}

function calculateWinrateOfFactions(battles: BattleWithPlayers[]) {
  const factions: Record<
    string,
    {
      winEvaluation: number;
      lossEvaluation: number;
    }
  > = {};
  for (const battle of battles) {
    const battleFactions: Record<string, { won: number; lost: number }> = {};
    for (const player of battle.values) {
      const faction = player.faction;
      if (faction === null || faction === "Unknown") continue;
      battleFactions[faction] ??= { won: 0, lost: 0 };
      if (player.teamId === battle.key.winningTeam)
        battleFactions[faction].won++;
      else battleFactions[faction].lost++;
    }
    for (const key in battleFactions) {
      const playersWon = battle.values.filter(
        (player) => player.teamId === battle.key.winningTeam,
      ).length;
      const playersLost = battle.values.length - playersWon;
      const factionResults = battleFactions[key];
      factions[key] ??= { winEvaluation: 0, lossEvaluation: 0 };
      factions[key] = {
        winEvaluation:
          factions[key].winEvaluation + factionResults.won / playersWon,
        lossEvaluation:
          factions[key].lossEvaluation + factionResults.lost / playersLost,
      };
    }
  }
  const factionEvaluation: Record<string, number> = {};
  for (const key in factions) {
    factionEvaluation[key] =
      factions[key].winEvaluation / factions[key].lossEvaluation;
  }
  return factionEvaluation;
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
    osToTime: [os: number, time: number][];
    osToTime2: [os: number, time: number][];
    osToTime3: [os: number, time: number][];
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

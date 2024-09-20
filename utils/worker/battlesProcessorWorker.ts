import consola from "consola";
import type { GetBattleQuery } from "~/server/api/battle";
import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import { WorkerServer } from "./core/server";

console.log("I'm running something");

type GetBattleDataCall = {
  type: "battle";
  requestParams: GetBattleQuery;
};

type DestroyCall = {
  type: "destroy";
};

export type BattleProcessorParams = GetBattleDataCall | DestroyCall;

export type BattleProcessorResult = {
  hello: string;
};

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
  const result = await fetch(
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
  consola.log("received", result);
  consola.log(
    "received",
    result.map((v) => v.key.id),
  );
}

function processSpecificMap(battles: BattleWithPlayers[]) {
  return {
    teamWinrate:  calculateTeamWinrate(battles),
    factionWinrate: calculateWinrateOfFactions(battles),
  }
}

function calculateTeamWinrate(battles: BattleWithPlayers[]) {
  const teamWins : Record<number, number> = {}

  for(const battle of battles) {
    const winningTeam = battle.key.winningTeam
    if(winningTeam === null)
      continue;
    teamWins[winningTeam] ??= 0;
    teamWins[winningTeam]++;
  }

  const teamWinrate : Record<number, number> = {}
  for(const key in teamWins) {
    teamWinrate[key] = teamWins[key] / battles.length
  }
  return teamWinrate
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
      if (faction === null) continue;
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

onmessage = async (message) => {
  const data = message.data as BattleProcessorParams;
  switch (data.type) {
    case "battle":
      await processBattleRequest(data.requestParams);
      break;
    case "destroy":
      break;
  }

  //switch (type?.toLowerCase()) {
  //  case "connect":
  //    postMessage('hello there')
  //    //console.log('hello there')
  //    break;
  //  case "destroy":
  //    break;
  //}
};

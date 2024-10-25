import type { GetBattleQuery } from "~/server/api/battle";
import { generateURLParams } from "./generateParams";
import type { BattleWithPlayers } from "~/server/utils/services/battleService";

export type GetBattlesClientParams = {
  map: string | null;
  limit: number | null;
  battleType: string;
  users: number[] | null;
  afterBattle: Date | null;
  osSelection: GetBattleQuery["osSelection"];
  rankedGame: boolean;
  waterIsLava: boolean;
};

async function requestBattles(params: GetBattlesClientParams) {
  const battles = await fetch(
    "/api/battle?" +
      generateURLParams<GetBattleQuery>(
        ["map", params.map],
        ["limit", params.limit?.toString()],
        ["users", params.users?.map((v) => v.toString())],
        ["battleType", params.battleType],
        [
          "afterBattle",
          params.afterBattle ? params.afterBattle.toString() : null,
        ],
        ["osSelection", params.osSelection],
        ["rankedGame", params.rankedGame.toString()],
        ["waterIsLava", params.waterIsLava.toString()],
      ),
    {
      headers: {
        "Content-Type": "application/json",
      },
      cache: import.meta.dev !== true ? "default" : "no-cache",
    },
  )
    .then(async (v) => (await v.json()) as BattleWithPlayers[])
    .then((v) => {
      console.log("received battles", v);
      return v;
    });
  return battles;
}

const BATTLE_REQUEST_ITEM_LIMIT = 500;
export async function getBattles(params: GetBattlesClientParams) {
  let currentLastBattle: Date | null = null;
  let leftElements = params.limit ?? BATTLE_REQUEST_ITEM_LIMIT;
  const battles: BattleWithPlayers[] = [];
  while (leftElements > 0) {
    const take =
      leftElements > BATTLE_REQUEST_ITEM_LIMIT
        ? BATTLE_REQUEST_ITEM_LIMIT
        : leftElements;
    leftElements -= take;

    const next = await requestBattles({
      ...params,
      afterBattle: currentLastBattle,
      limit: take,
    });

    if (next.length === 0) break;
    console.log(next);
    currentLastBattle = next[next.length - 1]!.key.startTime;

    battles.push(...next);
  }

  return battles;
}

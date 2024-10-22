import type { GetBattleQuery } from "~/server/api/battle";
import { generateParams } from "./generateParams";
import type { BattleWithPlayers } from "~/server/utils/services/battleService";

async function requestBattles(params: GetBattleQuery) {
  const battles = await fetch(
    "/api/battle?" +
      new URLSearchParams(
        generateParams<GetBattleQuery>(
          ["map", params.map],
          ["limit", params.limit?.toString()],
          ["users", params.users?.map((v) => v.toString())],
          ["battleType", params.battleType],
          [
            "afterBattle",
            params.afterBattle ? params.afterBattle.toString() : null,
          ],
          [
            "osSelection", params.osSelection
          ]
        ),
      ),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  ).then(async (v) => (await v.json()) as BattleWithPlayers[]);
  return battles;
}

const BATTLE_REQUEST_ITEM_LIMIT = 5000;
export async function getBattles(params: GetBattleQuery) {
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
      limit: take
    });

    if (next.length === 0) break;
    console.log(next);
    currentLastBattle = next[next.length - 1]!.key.startTime;

    battles.push(...next);
  }

  return battles;
}

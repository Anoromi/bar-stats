import type { MapDto } from "~/server/utils/dto/dto";
import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import { assert } from "../other/assert";
import { depthClusterize } from "./clusterize";
import type { LabeledPlayer } from "./labeledPlayers";

export async function clusterizePlayers(
  battles: BattleWithPlayers[],
  map: MapDto,
): Promise<{
  labeledPlayers: LabeledPlayer[];
  clusterCount: number;
}> {
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
      const translatedLeft = (playerTeam.left! * map.width! * 1000) / 2 - 1000;
      const translatedRight =
        (playerTeam.right! * map.width! * 1000) / 2 + 1000;
      const translatedTop = (playerTeam.top! * map.height! * 1000) / 2 - 1000;
      const translatedBottom =
        (playerTeam.bottom! * map.height! * 1000) / 2 + 1000;

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

  console.time("clusterize");
  const { data: clusterLabels, clusterCount } = await depthClusterize(
    players,
    (player) => ({
      x: player.player.startPosX!,
      y: player.player.startPosZ!,
      battleIndex: player.battleIndex,
    }),
    1000,
    20,
  );
  console.timeEnd("clusterize");

  const clusteredData = clusterLabels.map(
    (v, i) =>
      [
        battles[players[i].battleIndex].values.findIndex(
          (p) => p.userId === players[i].player.userId,
        ),
        players[i].battleIndex,
        v,
      ] as [number, number, number],
  );
  return {
    labeledPlayers: clusteredData,
    clusterCount,
  };
}

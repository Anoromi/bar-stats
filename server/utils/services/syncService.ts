import { inArray } from "drizzle-orm";
import type {
  BattleEntityInsert,
  BattleTeamEntityInsert,
  MapEntityInsert as MapEntityInsert,
  UserToBattleTeamEntityInsert,
} from "../database/schema";
import type { BarReplay } from "../api-calls/bar-replay";
import type { SchemaTransaction } from "../database/transactionType";
import type { BarReplayList } from "../api-calls/bar-replay-list";

export const SPECTATOR_TEAM_ID = -1;

class SyncService {
  async syncDatabase(pageSize: number) {
    const service = new BattleService();
    const lastBattle = await service.getLastBattle();
    console.log("current last battle", lastBattle);
    let boundary: Date;
    if (lastBattle === null) {
      const now = new Date();
      boundary = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);
    } else {
      boundary = lastBattle.startTime;
    }
    let page = 1;
    while (true) {
      const pageCount = 5;
      const replayLists = this.batchReplays(page, pageCount, pageSize);
      page += pageCount;
      console.time("replay-lists")
      const resolvedReplayLists = await Promise.all(replayLists);
      console.timeEnd("replay-lists")
      const resolvedReplays = resolvedReplayLists
        .flatMap((v) => v.data)
        .map((v) => v.id)
        .map((v) => getBarReplay(v));

      console.time("replays")
      const replays = await Promise.all(resolvedReplays);
      console.timeEnd("replays")
      const finish = await this.flushData(replays, boundary);
      if (finish) break;
    }
  }

  private batchReplays(start: number, count: number, pageSize: number) {
    const arr: Promise<BarReplayList>[] = [];
    for (let i = 0; i < count; i++) {
      arr.push(getBarReplayList(start + i, pageSize));
    }
    return arr;
  }

  private async flushData(replays: BarReplay[], boundary: Date) {
    return db.transaction(async (tx) => {
      replays = replays.filter(
        (replay) => new Date(replay.startTime).getTime() > boundary.getTime(),
      );

      if (replays.length === 0) {
        console.log("empty replays");
        return true;
      }

      await this.addMaps(tx, replays);

      const replayInsert = replays.map(
        (replay) =>
          ({
            id: replay.id,
            mapId: replay.Map.id,
            hasBots: replay.hasBots,
            endedNormally: replay.gameEndedNormally,
            startTime: new Date(replay.startTime),
            durationMs: replay.durationMs,
            playerCount: replay.AllyTeams.reduce(
              (sum, next) => sum + next.Players.length,
              0,
            ),
            gameVersion: replay.gameVersion,
            engineVersion: replay.engineVersion,
            waterIsLava: Boolean(Number(replay.gameSettings.map_waterislava)),
            isRanked: Boolean(Number(replay.gameSettings.ranked_game)),
            fullDurationMs: replay.fullDurationMs,
            winningTeam: replay.AllyTeams.find((v) => v.winningTeam)
              ?.allyTeamId,
            preset: replay.preset,
            battleType: this.generateBattleType(replay),
            averageOs: this.calculaceAverageOs(replay),
          }) satisfies BattleEntityInsert,
      );

      if (replayInsert.length > 0) {
        await Promise.all(
          replayInsert.map((v) =>
            tx.insert(battleTable).values(v).onConflictDoNothing(),
          ),
        );
      }

      // add teams
      const allyTeams = replays.flatMap((replay) => [
        ...replay.AllyTeams.map(
          (team) =>
            ({
              battleId: replay.id,
              teamNumber: team.allyTeamId,
              top: team.startBox?.top,
              bottom: team.startBox?.bottom,
              left: team.startBox?.left,
              right: team.startBox?.right,
            }) satisfies BattleTeamEntityInsert,
        ),
        {
          battleId: replay.id,
          teamNumber: SPECTATOR_TEAM_ID,
        },
      ]);

      console.log("add teams");

      if (allyTeams.length > 0) {
        await Promise.all(
          allyTeams.map((v) =>
            tx.insert(battleTeamTable).values(v).onConflictDoNothing(),
          ),
        );
      }

      console.log("added teams");

      // add users to teams
      const usersToTeams = replays.flatMap((replay) => {
        return [
          ...replay.AllyTeams.flatMap((team) => {
            return team.Players.flatMap((player) => {
              return {
                faction: player.faction,
                rank: player.rank,
                skill: player.skill,
                skillUncertainty: player.skillUncertainty,
                username: player.name,
                userId: player.userId,
                teamId: player.teamId,
                playerId: player.playerId,
                isSpectator: false,
                battleTeamBattleId: replay.id,
                battleTeamNumber: team.allyTeamId,
                startPosX: player.startPos?.x,
                startPosY: player.startPos?.y,
                startPosZ: player.startPos?.z,
              } satisfies UserToBattleTeamEntityInsert;
            });
          }),
          ...replay.Spectators.flatMap((spectator) => {
            return {
              rank: spectator.rank,
              battleTeamNumber: SPECTATOR_TEAM_ID,
              battleTeamBattleId: replay.id,
              skill: spectator.skill,
              skillUncertainty: spectator.skillUncertainty,
              userId: spectator.userId,
              isSpectator: true,
              username: spectator.name,
            } satisfies UserToBattleTeamEntityInsert;
          }),
        ];
      });

      console.log("add users");

      if (usersToTeams.length > 0) {
        await Promise.all(
          usersToTeams.map((v) =>
            tx.insert(userToBattleTable).values(v).onConflictDoNothing(),
          ),
        );
      }
      return false;
    });
  }

  private async addMaps(tx: SchemaTransaction, replays: BarReplay[]) {
    const mapService = useMapService();

    const allReplayMaps = new Map(
      replays.map((replay) => [replay.Map.id, replay]),
    );
    const replayMapsInDb = new Map(
      (
        await mapService.getMapsByMapId(
          replays.map((replay) => replay.Map.id),
          tx,
        )
      ).map((v) => [v.mapId, v]),
    );

    //console.log('mapsInDb', [...replayMapsInDb]);
    const newMaps = new Map<number, BarReplay>();
    for (const [mapId, replay] of allReplayMaps) {
      if (!replayMapsInDb.has(mapId)) {
        newMaps.set(mapId, replay);
      }
    }

    const neededUniversalMaps = [
      ...new Set(
        [...newMaps.values()].map((v) => getUniversalMapName(v.Map.scriptName)),
      ),
    ].map((v) => ({ name: v }) satisfies MapEntityInsert);
    const universalMapsInDb = await tx
      .select({ name: mapTable.name })
      .from(mapTable)
      .where(
        inArray(
          mapTable.name,
          neededUniversalMaps.map((v) => v.name),
        ),
      );

    const insertedUniversalMaps = neededUniversalMaps.filter((v) =>
      universalMapsInDb.every((x) => v.name != x.name),
    );
    if (insertedUniversalMaps.length > 0) {
      //await db.batch(

      await Promise.all(
        insertedUniversalMaps.map((v) => tx.insert(mapTable).values(v)),
      );
      //);
      //await db.insert(mapTable).values(insertedUniversalMaps);
    }

    const dbUniversalMaps = await tx
      .select()
      .from(mapTable)
      .where(
        inArray(
          mapTable.name,
          neededUniversalMaps.map((v) => v.name),
        ),
      );

    //console.log(
    //  "newMaps",
    //  [...newMaps].map((v) => v[1].Map),
    //);
    //console.log("newUniversalMaps", dbUniversalMaps);
    // insert new universal maps

    const createdUniversalMapsMap = new Map(
      dbUniversalMaps.map((v) => [v.name, v]),
    );

    const newMapsInsert = [...newMaps.values()].map((replay) => {
      //console.log(
      //  getUniversalMapName(replay.Map.scriptName),
      //  createdUniversalMapsMap.get(getUniversalMapName(replay.Map.scriptName)),
      //);
      return {
        mapId: replay.Map.id,
        fileName: replay.Map.fileName ?? null,
        scriptName: replay.Map.scriptName ?? null,
        name: replay.Map.scriptName,
        subclassOfId: createdUniversalMapsMap.get(
          getUniversalMapName(replay.Map.scriptName),
        )!.id,
        width: replay.Map.width,
        height: replay.Map.height,
      } satisfies MapEntityInsert;
    });

    // insert new maps + connect them to universalMaps
    //

    //console.log("insert new maps", newMapsInsert);
    console.log("new maps");
    if (newMapsInsert.length > 0) {
      //await db.batch(

      await Promise.all(
        newMapsInsert.map((v) => tx.insert(mapTable).values(v)),
      );
      //);
      //console.log("inserting", newMapsInsert);
    }
  }

  private generateBattleType(replay: BarReplay) {
    return replay.AllyTeams.map((team) => {
      return team.Players.length.toString();
    }).join("v");
  }

  private calculaceAverageOs(replay: BarReplay) {
    let sum = 0;
    let playerCount = 0;
    for (const team of replay.AllyTeams) {
      for (const player of team.Players) {
        sum += player.skill ?? 0;
        playerCount += 1;
      }
    }

    if (playerCount === 0) return 0;
    return sum / playerCount;
  }
}

export function useSyncService() {
  return new SyncService();
}

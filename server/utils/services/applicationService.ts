import { inArray } from "drizzle-orm";
import type {
  BattleEntityInsert,
  BattleTeamEntityInsert,
  MapEntityInsert as MapEntityInsert,
  UserToBattleTeamEntityInsert,
} from "../database/schema";
import { consola } from "consola";
import type { BarReplay } from "../api-calls/bar-replay";

export const SPECTATOR_TEAM_ID = -1;

class ApplicationService {
  async syncDatabase() {
    consola.log("starting");
    const service = new BattleService();
    const lastBattle = await service.getLastBattle();
    consola.log("current last battle", lastBattle);
    let boundary: Date;
    if (lastBattle === null) {
      const now = new Date();
      boundary = new Date(now.getTime() - 1000 * 60 * 60 * 24);
      //boundary = new Date(
      //  now.getUTCFullYear(),
      //  now.getUTCMonth(),
      //  now.getUTCDate(),
      //);
    } else {
      boundary = lastBattle.startTime;
    }
    let page = 1;
    while (true) {
      const requests = (await getBarReplayList(page, 20)).data
        .map((v) => v.id)
        .map((v) => getBarReplay(v));
      page++;

      consola.log("page", page);
      let replays = await Promise.all(requests);

      replays = replays.filter(
        (replay) => new Date(replay.startTime).getTime() > boundary.getTime(),
      );

      if (replays.length === 0) {
        consola.log("empty replays");
        break;
      }

      //consola.log('min', min(replays, (a, b) => new Date(a.startTime).getTime() - new  Date(b.startTime).getTime()))

      await this.addMaps(replays);

      // add battles

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
            fullDurationMs: replay.fullDurationMs,
            winningTeam: replay.AllyTeams.find((v) => v.winningTeam)
              ?.allyTeamId,
            preset: replay.preset,
            battleType: this.generateBattleType(replay),
          }) satisfies BattleEntityInsert,
      );

      //logger.log('hehe', )
      //consola.info(replayInsert.map((v) => v.id));
      if (replayInsert.length > 0)
        await db.insert(battleTable).values(replayInsert).onConflictDoNothing();

      // add teams
      const allyTeams = replays.flatMap((replay) => [
        ...replay.AllyTeams.map(
          (team) =>
            ({
              battleId: replay.id,
              teamNumber: team.allyTeamId,
            }) satisfies BattleTeamEntityInsert,
        ),
        {
          battleId: replay.id,
          teamNumber: SPECTATOR_TEAM_ID,
        },
      ]);

      consola.log("add teams");
      //consola.log(allyTeams);

      if (allyTeams.length > 0)
        await db
          .insert(battleTeamTable)
          .values(allyTeams)
          .onConflictDoNothing();

      consola.log("added teams");

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

      consola.log("add users");
      //consola.log(usersToTeams);

      if (usersToTeams.length > 0)
        await db
          .insert(userToBattleTable)
          .values(usersToTeams)
          .onConflictDoNothing();
    }
  }

  private async addMaps(replays: BarReplay[]) {
    const mapService = useMapService();

    const allReplayMaps = new Map(
      replays.map((replay) => [replay.Map.id, replay]),
    );
    const replayMapsInDb = new Map(
      (
        await mapService.getMapsByMapId(replays.map((replay) => replay.Map.id))
      ).map((v) => [v.mapId, v]),
    );

    //consola.log('mapsInDb', [...replayMapsInDb]);
    const newMaps = new Map<number, BarReplay>();
    for (const [mapId, replay] of allReplayMaps) {
      if (!replayMapsInDb.has(mapId)) {
        newMaps.set(mapId, replay);
      }
    }

    const neededUniversalMaps = [...newMaps.values()].map(
      (v) =>
        ({
          name: getUniversalMapName(v.Map.scriptName),
        }) satisfies MapEntityInsert,
    );

    const universalMapsInDb = await db
      .select({ name: mapTable.name })
      .from(mapTable)
      .where(
        inArray(
          mapTable.name,
          neededUniversalMaps.map((v) => v.name),
        ),
      );

    //consola.log("insert universal maps", universalMaps);
    const insertedUniversalMaps = neededUniversalMaps.filter((v) =>
      universalMapsInDb.every((x) => v.name != x.name),
    );
    if (insertedUniversalMaps.length > 0)
      await db.insert(mapTable).values(insertedUniversalMaps);

    const dbUniversalMaps = await db
      .select()
      .from(mapTable)
      .where(
        inArray(
          mapTable.name,
          neededUniversalMaps.map((v) => v.name),
        ),
      );

    consola.log(
      "newMaps",
      [...newMaps].map((v) => v[1].Map),
    );
    //consola.log("newUniversalMaps", dbUniversalMaps);
    // insert new universal maps

    const createdUniversalMapsMap = new Map(
      dbUniversalMaps.map((v) => [v.name, v]),
    );

    const newMapsInsert = [...newMaps.values()].map((replay) => {
      //consola.log(
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
      } satisfies MapEntityInsert;
    });

    // insert new maps + connect them to universalMaps
    //

    //consola.log("insert new maps", newMapsInsert);
    consola.log("new maps");
    if (newMapsInsert.length > 0) {
      await db.insert(mapTable).values(newMapsInsert);
      //consola.log("inserting", newMapsInsert);
    }
  }

  private generateBattleType(replay: BarReplay) {
    return replay.AllyTeams.map((team) => {
      return team.Players.length.toString();
    }).join("v");
  }
}

export function useApplicationService() {
  return new ApplicationService();
}

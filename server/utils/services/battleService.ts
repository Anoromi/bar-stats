import { and, eq, inArray, max, SQLWrapper } from "drizzle-orm";
import {
  BattleEntity,
  battleTable,
  BattleEntityInsert,
} from "../database/schema";
import { logAnalyze } from "../database/explainAnalyze";
import { MapService } from "#imports";
import consola from "consola";

export const lastBattleQuery = () =>
  db
    .select()
    .from(battleTable)
    .where(
      eq(
        battleTable.startTime,
        db.select({ max: max(battleTable.startTime) }).from(battleTable),
      ),
    )
    .limit(1);

type BattleDto = {
  id: string;
  engineVErsion: string;
  mapId: number;
  gameVersion: string;
  startTime: number;
  durationMs: number;
  fullDurationMs: number;
  winningTeam: number;
  hasBots: boolean;
  endedNormally: boolean;
  playerCount: number;
  battleType: string;
};

export class BattleService {
  constructor(private mapService: MapService = useMapService()) {}

  async getLastBattle(): Promise<BattleEntity | null> {
    const result = await db
      .select()
      .from(battleTable)
      .where(
        eq(
          battleTable.startTime,
          db.select({ max: max(battleTable.startTime) }).from(battleTable),
        ),
      )
      .limit(1);

    if (result.length === 0) return null;
    return result[0];
  }

  async insertBattle(battle: BattleEntityInsert): Promise<BattleEntity> {
    const result: BattleEntity[] = await db
      .insert(battleTable)
      .values(battle)
      .returning();
    return result[0];
  }

  async getBattles(
    userIds: number[] | null,
    battleMap: string | null,
    limit: number,
  ) {
    const conditions: SQLWrapper[] = [];

    if (userIds !== null) {
      conditions.push(inArray(userToBattleTable.userId, userIds));
    }

    if (battleMap !== null) {
      consola.log("fine", battleMap);
      const searchedMaps = await this.mapService.getMapByName(battleMap);
      if (searchedMaps === null) return [];

      const possibleMapIds =
        searchedMaps.values.length === 0
          ? [searchedMaps.key.mapId!]
          : searchedMaps.values.map((v) => v.id);
      conditions.push(inArray(battleTable.mapId, possibleMapIds));
      //searchedMaps.
      //const searchedMaps = await db
      //  .select()
      //  .from(mapTable)
      //  .where(eq(mapTable.name, battleMap))
      //  .leftJoin(mapTable, eq(mapTable.id, mapTable.subclassOfId));

      //conditions.push()
      //conditions.push(e)
    }
    consola.log("fine 2", conditions);

    const battleIds = await logAnalyze(
      db
        .select()
        .from(userToBattleTable)
        .innerJoin(
          battleTable,
          eq(userToBattleTable.battleTeamBattleId, battleTable.id),
        )
        .where(and(...conditions))
        .limit(limit),
    );
  }

  insertBattles() {}
}

export function useBattleService() {
  return new BattleService();
}

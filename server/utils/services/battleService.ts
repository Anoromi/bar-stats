import type { SQLWrapper } from "drizzle-orm";
import { and, count, desc, eq, exists, inArray, max, sql } from "drizzle-orm";
import type { BattleEntity } from "../database/schema";
import { battleTable } from "../database/schema";
import consola from "consola";
import type { Grouped } from "../array/groupBy";
import type {
  BattleDto,
  BattleDtoInsert,
  UserToBattleTeamDto,
} from "../dto/dto";
import type { MapService } from "#imports";

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

export class BattleService {
  constructor(private mapService: MapService = useMapService()) {}

  async getLastBattle(): Promise<BattleDto | null> {
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

  async insertBattle(battle: BattleDtoInsert): Promise<BattleEntity> {
    const result: BattleEntity[] = await db
      .insert(battleTable)
      .values(battle)
      .returning();
    return result[0];
  }

  async getBattles(
    userIds: number[] | null,
    battleMap: string | null,
    battleType: string | null,
    limit: number,
  ): Promise<BattleWithPlayers[]> {
    const conditions: SQLWrapper[] = [];

    if (userIds !== null) {
      //conditions.push(inArray(userToBattleTable.userId, userIds));

      const selectedUserId = "selectedUserId";

      const userSelectionOperator = eq(
        db
          .select({ users: count(sql.raw(selectedUserId)) })
          .from(
            selectValues(
              [selectedUserId],
              userIds.map((v) => [[v]]),
            ),
          )
          .where(
            exists(
              db
                .select()
                .from(userToBattleTable)
                .where(
                  and(
                    eq(userToBattleTable.battleTeamBattleId, battleTable.id),
                    eq(userToBattleTable.userId, sql.raw(selectedUserId)),
                  ),
                ),
            ),
          ),
        userIds.length,
      );

      conditions.push(userSelectionOperator);
    }

    if (battleMap !== null) {
      //consola.log("fine", battleMap);
      //consola.log('hello hehe')
      const searchedMaps = await this.mapService.getMapByName(battleMap);
      //consola.log('hello hehe', searchedMaps)
      if (searchedMaps === null) return [];

      const possibleMapIds =
        searchedMaps.values.length === 0
          ? [searchedMaps.key.mapId!]
          : searchedMaps.values.map((v) => v.mapId!);

      consola.log("hello hehe", possibleMapIds);
      conditions.push(inArray(battleTable.mapId, possibleMapIds));
    }

    const battleIds = await db
      .select({
        id: battleTable.id,
      })
      .from(battleTable)
      .where(
        and(
          ...conditions,
          eq(userToBattleTable.isSpectator, false),
          eq(battleTable.endedNormally, true),
          eq(battleTable.hasBots, false),
          ...(battleType != null
            ? [eq(battleTable.battleType, battleType)]
            : []),
        ),
      )
      .innerJoin(
        userToBattleTable,
        eq(battleTable.id, userToBattleTable.battleTeamBattleId),
      )
      .limit(limit)
      .orderBy(desc(battleTable.startTime));
    const battleRequests = battleIds.map((v) =>
      db
        .select({
          battle: battleTable,
          player: userToBattleTable,
        })
        .from(battleTable)
        .where(
          and(
            eq(battleTable.id, v.id),
            eq(userToBattleTable.isSpectator, false),
          ),
        )
        .innerJoin(
          userToBattleTable,
          eq(battleTable.id, userToBattleTable.battleTeamBattleId),
        )
        .limit(limit)
        .orderBy(desc(battleTable.startTime)),
    );

    const battle = (await Promise.all(battleRequests)).map((v) => {
      return {
        key: v[1].battle,
        values: v.map((x) => x.player),
      } satisfies BattleWithPlayers;
    });
    //const k = [
    //  db.select().from(battleTable)
    //] as const
    //db.batch(k)
    //db.batch
    // db.batch(
    //     k
    //   // battleIds.map((v) =>
    //   //   db
    //   //     .select({
    //   //       battle: battleTable,
    //   //       player: userToBattleTable,
    //   //     })
    //   //     .from(battleTable)
    //   //     .where(eq(battleTable.id, v.id))
    //   //     .innerJoin(
    //   //       userToBattleTable,
    //   //       eq(battleTable.id, userToBattleTable.battleTeamBattleId),
    //   //     )
    //   //     .limit(limit)
    //   //     .orderBy(desc(battleTable.startTime)),
    //   // ),
    // );
    //const battle = await logAnalyze(
    //  db
    //    .select({
    //      battle: battleTable,
    //      player: userToBattleTable,
    //    })
    //    .from(battleTable)
    //    .where()
    //    .innerJoin(
    //      userToBattleTable,
    //      eq(battleTable.id, userToBattleTable.battleTeamBattleId),
    //    )
    //    .limit(limit)
    //    .orderBy(desc(battleTable.startTime)),
    //);

    // return groupByMappedWithMap(battle, {
    //   selectGroupKey: (value) => value.battle,
    //   selectGroupValue: (value) => value.player,
    //   getMappableKey: (group) => group.id,
    // });
    return battle;
  }

  insertBattles() {}
}
export type BattleWithPlayers = Grouped<UserToBattleTeamDto, BattleDto>;

export function useBattleService() {
  return new BattleService();
}

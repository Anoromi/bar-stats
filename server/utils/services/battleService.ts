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
import { createClient } from "@libsql/client";

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

    console.count("battle");
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

    console.count("battle");
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

    console.count("battle");

    const battleIds = db
      .selectDistinct({
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

    //console.log("ids", await battleIds);
    const battles = await db
      .select({
        battle: battleTable,
        player: userToBattleTable,
      })
      .from(battleTable)
      .where(
        and(
          eq(userToBattleTable.isSpectator, false),
          inArray(battleTable.id, battleIds),
        ),
      )
      .innerJoin(
        userToBattleTable,
        eq(battleTable.id, userToBattleTable.battleTeamBattleId),
      )
      .orderBy(desc(battleTable.startTime));
    //const { DB_AUTH_TOKEN, DB_URL } = useRuntimeConfig();
    //const client = createClient({ url: DB_URL, authToken: DB_AUTH_TOKEN });
    //const query = battles.toSQL();
//    try {
//      const result = await client.execute({
//        sql: `
//SELECT
//  "battle"."id",
//  "battle"."engine-version",
//  --"battle"."map-id",
//  --"battle"."game-version",
//  --"battle"."start-time",
//  --"battle"."duration-ms",
//  --"battle"."full-duration-ms",
//  --"battle"."winning-team",
//  --"battle"."has-bots",
//  --"battle"."ended-normally",
//  --"battle"."player-count",
//  --"battle"."battle-type",
//  --"battle"."preset",
//  "user-to-battle"."user-username"
//  --"user-to-battle"."user-id",
//  --"user-to-battle"."battle-team-battle-id",
//  --"user-to-battle"."battle-team-number",
//  --"user-to-battle"."skill",
//  --"user-to-battle"."skill-uncertainty",
//  --"user-to-battle"."rank",
//  --"user-to-battle"."is-spectator",
//  --"user-to-battle"."player-id",
//  --"user-to-battle"."team-id",
//  --"user-to-battle"."faction",
//  --"user-to-battle"."start-pos-x",
//  --"user-to-battle"."start-pos-y",
//  --"user-to-battle"."start-pos-z"
//FROM
//  "battle"
//  INNER JOIN "user-to-battle" ON "battle"."id" = "user-to-battle"."battle-team-battle-id"
//WHERE
//  (
//    "user-to-battle"."is-spectator" = 0
//    AND "battle"."id" IN (
//      SELECT DISTINCT
//        "battle"."id"
//      FROM
//        "battle"
//        INNER JOIN "user-to-battle" ON "battle"."id" = "user-to-battle"."battle-team-battle-id"
//      WHERE
//        (
//          "user-to-battle"."is-spectator" = 0
//          AND "battle"."ended-normally" = 1
//          AND "battle"."has-bots" = 0
//        )
//      ORDER BY
//        "battle"."start-time" DESC
//      LIMIT
//        10
//    )
//  )
//ORDER BY
//  "battle"."start-time" DESC
//      `,
//         
//        args: [],
//      });
//
//      console.log("result", result);
//    } catch (e) {
//      console.log(e);
//    }
    //const result = await db.run(battles.getSQL());

    //throw new Error();
    // console.count("battle");
    // const battleRequests = battleIds.map((v) =>
    //   db
    //     .select({
    //       battle: battleTable,
    //       player: userToBattleTable,
    //     })
    //     .from(battleTable)
    //     .where(
    //       and(
    //         eq(battleTable.id, v.id),
    //         eq(userToBattleTable.isSpectator, false),
    //       ),
    //     )
    //     .innerJoin(
    //       userToBattleTable,
    //       eq(battleTable.id, userToBattleTable.battleTeamBattleId),
    //     )
    //     .limit(1)
    //     .orderBy(desc(battleTable.startTime)),
    // );
    //
    // type BattleRequestsResult = Awaited<(typeof battleRequests)[number]>;
    //
    // console.count("battle");
    // console.log("count", battleRequests.length);
    //
    // const q = [db.select().from(battleTable)];
    //
    // const battle = (
    //   (await db.batch(battleRequests as any)) as BattleRequestsResult[]
    // ).map((v) => {
    //   console.log(v);
    //   return {
    //     key: v[0].battle,
    //     values: v.map((x) => x.player),
    //   } satisfies BattleWithPlayers;
    // });
    console.count("battle");
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

    return groupByMappedWithMap(battles, {
      selectGroupKey: (value) => value.battle,
      selectGroupValue: (value) => value.player,
      getMappableKey: (group) => group.id,
    });
    //return battle;
  }

  insertBattles() {}
}
export type BattleWithPlayers = Grouped<UserToBattleTeamDto, BattleDto>;

export function useBattleService() {
  return new BattleService();
}

import type { SQL, SQLWrapper } from "drizzle-orm";
import {
  and,
  count,
  desc,
  eq,
  exists,
  inArray,
  lt,
  max,
  sql,
} from "drizzle-orm";
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

  private async getBattlesAfter(
    date: Date | null,
    whereClause: SQL<unknown>,
    limit: number,
  ) {
    const battleIds = db
      .selectDistinct({
        id: battleTable.id,
      })
      .from(battleTable)
      .where(
        and(
          whereClause,
          ...(date !== null ? [lt(battleTable.startTime, new Date(date))] : []),
        ),
      )
      .innerJoin(
        userToBattleTable,
        eq(battleTable.id, userToBattleTable.battleTeamBattleId),
      )
      .limit(limit)
      .orderBy(desc(battleTable.startTime));

    //console.log("ids", await battleIds);
    const battles = await logAnalyze(
      db
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
        .orderBy(desc(battleTable.startTime)),
    );
    return battles;
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
    const whereClause = and(
      eq(battleTable.endedNormally, true),
      eq(battleTable.hasBots, false),
      eq(userToBattleTable.isSpectator, false),
      ...conditions,
      ...(battleType != null ? [eq(battleTable.battleType, battleType)] : []),
    );

    const battles: BattleWithPlayers[] = [];
    let leftElements = limit;
    let currentLastBattle: Date | null = null;
    while (leftElements > 0) {
      const take = leftElements > 500 ? 500 : leftElements;
      leftElements -= take;

      const next = await this.getBattlesAfter(
        currentLastBattle,
        whereClause!,
        take,
      );

      if(next.length === 0)
        break;

      const grouped = groupByMappedWithMap(next, {
        selectGroupKey: (value) => value.battle,
        selectGroupValue: (value) => value.player,
        getMappableKey: (group) => group.id,
      });
      console.log('normal vs grouped', next.length, grouped.length, take, leftElements, next.at(-1), grouped.at(-1));
      currentLastBattle = grouped.at(-1)!.key.startTime;
      battles.push(...grouped);
    }

    return battles;
  }

  insertBattles() {}
}
export type BattleWithPlayers = Grouped<UserToBattleTeamDto, BattleDto>;

export function useBattleService() {
  return new BattleService();
}

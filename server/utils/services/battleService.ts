import type { SQL, SQLWrapper } from "drizzle-orm";
import {
  and,
  count,
  desc,
  eq,
  exists,
  gte,
  inArray,
  lt,
  max,
  sql,
} from "drizzle-orm";
import type { BattleEntity, BattleTeamEntity } from "../database/schema";
import { battleTable } from "../database/schema";
import consola from "consola";
import type { Grouped } from "../array/groupBy";
import type {
  BattleDto,
  BattleDtoInsert,
  BattleTeamDto,
  ProcessingUser,
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

    const battlesRequest = logAnalyze(
      db
        .select()
        .from(battleTable)
        .where(and(inArray(battleTable.id, battleIds)))
        .orderBy(desc(battleTable.startTime)),
    );
    const usersToBattleRequest = logAnalyze(
      db
        .select({
          userId: userToBattleTable.userId,
          battleTeamBattleId: userToBattleTable.battleTeamBattleId,
          battleTeamNumber: userToBattleTable.battleTeamNumber,
          skill: userToBattleTable.skill,
          rank: userToBattleTable.rank,
          faction: userToBattleTable.faction,
          startPosX: userToBattleTable.startPosX,
          startPosZ: userToBattleTable.startPosZ,
        })
        .from(userToBattleTable)
        .where(
          and(
            eq(userToBattleTable.isSpectator, false),
            inArray(userToBattleTable.battleTeamBattleId, battleIds),
          ),
        ),
    );
    const teamsToBattleRequest = await logAnalyze(
      db
        .select()
        .from(battleTeamTable)
        .where(
          and(
            gte(battleTeamTable.teamNumber, 0),
            inArray(battleTeamTable.battleId, battleIds),
          ),
        ),
    );
    const [battles, usersToBattle, teamsToBattle] = await Promise.all([
      battlesRequest,
      usersToBattleRequest,
      teamsToBattleRequest,
    ]);
    const battleMap = new Map<string, BattleEntity>();
    const userMap = new Map<string, ProcessingUser[]>();
    const teamMap = new Map<string, BattleTeamEntity[]>();

    for (const v of battles) {
      battleMap.set(v.id, v);
    }
    for (const v of usersToBattle) {
      const arr = userMap.get(v.battleTeamBattleId);
      if (arr === undefined) {
        userMap.set(v.battleTeamBattleId, [v]);
      } else {
        arr.push(v);
        userMap.set(v.battleTeamBattleId, arr);
      }
    }
    for (const v of teamsToBattle) {
      const arr = teamMap.get(v.battleId);
      if (arr === undefined) {
        teamMap.set(v.battleId, [v]);
      } else {
        arr.push(v);
        teamMap.set(v.battleId, arr);
      }
    }

    console.log("userMap", userMap);
    const grouped: BattleWithPlayers[] = [];

    for (const v of battleMap) {
      console.log("v", v[1], teamMap.get(v[0]), userMap.get(v[0]));
      grouped.push({
        key: v[1],
        teams: teamMap.get(v[0]) ?? [],
        values: userMap.get(v[0]) ?? [],
      });
    }

    return grouped;
  }

  async getBattles({userIds, battleMap, battleType, limit}: {
    userIds: number[] | null;
    battleMap: string | null;
    battleType: string | null;
    limit: number;
  }): Promise<BattleWithPlayers[]> {
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

      if (next.length === 0) break;

      //const grouped = group2ByMappedWithMap(next, {
      //  selectGroupKey: (value) => value.battle,
      //  selectGroupValue: (value) => value.player,
      //  selectGroupValue2: (value) => value.team,
      //  getMappableKey: (group) => group.id,
      //});
      currentLastBattle = next.at(-1)!.key.startTime;

      battles.push(...next);
    }

    return battles;
  }

  insertBattles() {}
}
export type BattleWithPlayers = Grouped<ProcessingUser, BattleDto> & {
  teams: BattleTeamDto[];
};

export function useBattleService() {
  return new BattleService();
}

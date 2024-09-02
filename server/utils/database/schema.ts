import { relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  index,
  foreignKey,
} from "drizzle-orm/sqlite-core";
import { insensitiveText } from "./insensitiveText";

export const battleTable = sqliteTable(
  "battle",
  {
    id: text("id").primaryKey().notNull(),
    engineVersion: text("engine-version").notNull(),
    mapId: integer("map-id").notNull(),
    gameVersion: text("game-version").notNull(),
    startTime: integer("start-time", { mode: "timestamp_ms" }).notNull(),
    durationMs: integer("duration-ms").notNull(),
    fullDurationMs: integer("full-duration-ms").notNull(),
    winningTeam: integer("winning-team"),
    hasBots: integer("has-bots", { mode: "boolean" }).notNull(),
    endedNormally: integer("ended-normally", { mode: "boolean" }).notNull(),
    playerCount: integer("player-count").notNull(),
    battleType: text("battle-type").notNull(),
    preset: text("preset"),
  },
  (table) => {
    return {
      startTimeIndex: index("start-time-index").on(table.startTime),
    };
  },
);

export const mapTable = sqliteTable(
  "map",
  {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    mapId: integer("bar-map-id"),
    fileName: text("filename"),
    scriptName: text("script-name"),
    name: insensitiveText("name", {}).notNull(),
    subclassOfId: integer("subclass-of"),
  },
  (table) => {
    return {
      name_idx: index("map-name-idx").on(table.name),
      subclass_foreign_key: foreignKey({
        name: "subclass-foreign-key",
        columns: [table.subclassOfId],
        foreignColumns: [table.id],
      }),
      subclassIndex: index("map-subclass-idx").on(table.subclassOfId),
      mapIdIndex: index("map-mapId-idx").on(table.mapId),
    };
  },
);

export const mapRelations = relations(mapTable, ({ one, many }) => ({
  superclass: one(mapTable, {
    fields: [mapTable.subclassOfId],
    references: [mapTable.id],
  }),
  subclass: many(mapTable, {
    relationName: "subclass",
  }),
}));

export const battleTeamTable = sqliteTable(
  "battle-team",
  {
    battleId: text("battle-id")
      .references(() => battleTable.id)
      .notNull(),
    teamNumber: integer("team-number").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        name: "battleId-teamId-key",
        columns: [table.battleId, table.teamNumber],
      }),
    };
  },
);

export const userToBattleTable = sqliteTable(
  "user-to-battle",
  {
    username: text("user-username"),
    userId: integer("user-id"),
    battleTeamBattleId: text("battle-team-battle-id").notNull(),
    battleTeamNumber: integer("battle-team-number").notNull(),
    skill: real("skill"),
    skillUncertainty: real("skill-uncertainty"),
    rank: integer("rank"),
    isSpectator: integer("is-spectator", { mode: "boolean" }).notNull(),
    playerId: integer("player-id"),
    teamId: integer("team-id"),
    faction: text("faction"),
    startPosX: real("start-pos-x"),
    startPosY: real("start-pos-y"),
    startPosZ: real("start-pos-z"),
  },
  (table) => {
    return {
      pk: primaryKey({
        name: "username-battle-key",
        columns: [
          table.userId,
          table.battleTeamBattleId,
          table.battleTeamNumber,
        ],
      }),
      battleTeamFk: foreignKey({
        name: "user-to-battle-battle-team-foreignKey",
        columns: [table.battleTeamBattleId, table.battleTeamNumber],
        foreignColumns: [battleTeamTable.battleId, battleTeamTable.teamNumber],
      }),

      battleTeamIndex: index("user-to-battle-battle-team-idx").on(
        table.battleTeamNumber,
        table.battleTeamBattleId,
      ),

      userIdIndex: index("user-to-battle-user-id-idx").on(table.userId),
    };
  },
);

export const userToBattleRelations = relations(
  userToBattleTable,
  ({ one }) => ({
    battleTeam: one(battleTeamTable, {
      fields: [
        userToBattleTable.battleTeamBattleId,
        userToBattleTable.battleTeamNumber,
      ],
      references: [battleTeamTable.battleId, battleTeamTable.teamNumber],
    }),
  }),
);

export type BattleEntity = typeof battleTable.$inferSelect;
export type BattleEntityInsert = typeof battleTable.$inferInsert;

export type BattleTeamEntity = typeof battleTeamTable.$inferSelect;
export type BattleTeamEntityInsert = typeof battleTeamTable.$inferInsert;

export type UserToBattleTeamEntity = typeof userToBattleTable.$inferSelect;
export type UserToBattleTeamEntityInsert =
  typeof userToBattleTable.$inferInsert;

export type MapEntity = typeof mapTable.$inferSelect;
export type MapEntityInsert = typeof mapTable.$inferInsert;

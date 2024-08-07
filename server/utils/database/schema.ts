import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex, real, primaryKey } from 'drizzle-orm/sqlite-core';


//export const users = sqliteTable('users', {
//  username: text('username', { length: 50 }).notNull().primaryKey(),
//  countryCode: text('countryCode', {
//    length: 10
//  })
//})
//
//export const userIds = sqliteTable('user-ids', {
//  id: integer('id').primaryKey().notNull(),
//  username: text('user_username').notNull().references(() => users.username)
//})


export const battle = sqliteTable('battle', {
  id: text('id').primaryKey().notNull(),
  fileName: text('filename', {
    length: 200
  }).notNull(),
  engineVersion: text('engineVersion', {
    length: 100
  }).notNull(),
  gameVersion: text('gameVersion', {
    length: 100
  }).notNull(),
  startTime: integer('startTime', { mode: 'timestamp_ms' }).notNull(),
  durationMs: integer('durationMs').notNull(),
  fullDurationMs: integer('fullDurationMs').notNull(),
  winningTeam: integer('winning-team'),
  hasBots: integer('has-bots', { mode: 'boolean' }).notNull(),
  endedNormally: integer('ended-normally', { mode: 'boolean' }).notNull(),
})

export const battleTeam = sqliteTable('battle-team', {
  battleId: text('battle-id').references(() => battle.id).notNull(),
  teamNumber: integer('team-number').notNull(),
}, (table) => {
  return {
    pk: primaryKey({ name: 'battleId-teamId-key', columns: [table.battleId, table.teamNumber] })
  }
})

export const userToBattle = sqliteTable('user-to-battle', {
  username: text('user-username').notNull(),
  userId: integer('user-id').notNull(),
  battleTeamBattleId: text('battle-team-battle-id').references(() => battleTeam.battleId).notNull(),
  battleTeamNumber: text('battle-team-number').references(() => battleTeam.teamNumber).notNull(),
  skill: real('skill').notNull(),
  skillUncertainty: real('skill-uncertainty').notNull(),
  isSpectator: integer('is-spectator', { mode: 'boolean' }).notNull(),

  playerId: integer('player-id'),
  teamId: integer('team-id'),
  faction: text('faction'),
  startPosX: real('start-pos-x'),
  startPosY: real('start-pos-y'),
  startPosZ: real('start-pos-z'),
  rank: integer('rank').notNull(),
}, (table) => {
  return {
    pk: primaryKey({
      name: 'username-battle-key', columns: [table.userId, table.battleTeamBattleId, table.battleTeamNumber]
    }),


  }
})


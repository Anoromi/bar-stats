import type {
  BattleEntity,
  BattleEntityInsert,
  BattleTeamEntityInsert,
  MapEntity,
  MapEntityInsert,
  UserToBattleTeamEntity,
  UserToBattleTeamEntityInsert,
} from "../database/schema";

export type MapDto = MapEntity;
export type MapDtoInsert = MapEntityInsert;

export type BattleDto = BattleEntity;
export type BattleDtoInsert = BattleEntityInsert;

export type BattleTeamDto = BattleTeamEntity;
export type BattleTeamDtoInsert = BattleTeamEntityInsert;

export type UserToBattleTeamDto = UserToBattleTeamEntity;
export type UserToBattleTeamDtoInsert = UserToBattleTeamEntityInsert;

export type UserDto = {
  username: string;
  id: number[];
  countryCode: string | null;
};

export type ProcessingUser = Pick<
  UserToBattleTeamDto,
  | "rank"
  | "skill"
  | "startPosX"
  | "startPosZ"
  | "battleTeamBattleId"
  | "battleTeamNumber"
  | "userId"
  | "faction"
>;


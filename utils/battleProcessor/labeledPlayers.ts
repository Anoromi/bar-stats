import type { BattleWithPlayers } from "~/server/utils/services/battleService";

export type LabeledPlayer = [
  playerIndex: number,
  battleIndex: number,
  label: number,
];

export function extractBattle(
  battles: BattleWithPlayers[],
  player: LabeledPlayer,
) {
  return battles[player[1]];
}
export function extractPlayer(
  battles: BattleWithPlayers[],
  player: LabeledPlayer,
) {
  return battles[player[1]].values[player[0]];
}

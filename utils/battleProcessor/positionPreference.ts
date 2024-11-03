import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import { extractBattle, extractPlayer, type LabeledPlayer } from "./labeledPlayers";

export function calculatePositionPreference(battles: BattleWithPlayers[], clusterLabels: LabeledPlayer[], searchedLabel: number) {
  let avg = 0;
  let count = 0;

  for (let i = 0; i < clusterLabels!.length; i++) {
    const label = clusterLabels![i];
    if (searchedLabel !== label[2]) continue;

    const battle = extractBattle(battles, label);
    const player = extractPlayer(battles, label);

    if (player.skill === null) continue;

    const sortedPlayers = Array(...battle.values)
      .filter((v) => v.battleTeamNumber === player.battleTeamNumber)
      .sort((a, b) => (a.skill ?? 0) - (b.skill ?? 0));

    const position = sortedPlayers.findIndex((v) => v === player);
    if (position >= sortedPlayers.length / 2)
      avg += position - sortedPlayers.length / 2 + 1;
    else if (position < Math.floor(sortedPlayers.length / 2))
      avg -= sortedPlayers.length / 2 - position;

    count++;
  }
  if (count === 0) return 0;
  return avg / count;
}

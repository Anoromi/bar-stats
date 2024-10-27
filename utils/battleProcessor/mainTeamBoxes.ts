import type { BattleWithPlayers } from "~/server/utils/services/battleService";

export function normalizeBattleTeamBoxes(battles: BattleWithPlayers[]) {
  type TeamCombination = (typeof battles)[number]["teams"];
  const b: [TeamCombination, number][] = [];

  function match(groupA: TeamCombination, groupB: TeamCombination) {
    return (
      groupA.length === groupB.length &&
      groupA.every((a) => {
        return groupB.some((b) => {
          return (
            b.teamNumber === a.teamNumber &&
            b.top === a.top &&
            b.bottom === a.bottom &&
            b.left === a.left &&
            b.right === a.right
          );
        });
      })
    );
  }

  for (let i = 0; i < battles.length; i++) {
    const battle = battles[i];
    const pos = b.findIndex((v) => match(battle.teams, v[0]));
    if (pos === -1) b.push([battle.teams, 1]);
    else b[pos][1]++;
  }

  let biggestCombination: TeamCombination = b[0][0];
  let biggestCombinationCount: number = b[0][1];
  for (let i = 0; i < b.length; i++) {
    if (b[i][1] > biggestCombinationCount) {
      [biggestCombination, biggestCombinationCount] = b[i];
    }
  }

  return battles.filter(v => match(v.teams, biggestCombination))
}

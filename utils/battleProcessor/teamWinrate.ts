
export type BattleTeamWinrateData = {
  key: {
    winningTeam: number | null
  }
}

export function calculateTeamWinrate(battles: BattleTeamWinrateData[]) {
  const teamWins: Record<number, number> = {};

  for (const battle of battles) {
    const winningTeam = battle.key.winningTeam;
    if (winningTeam === null) continue;
    teamWins[winningTeam] ??= 0;
    teamWins[winningTeam]++;
  }

  const teamWinrate: Record<number, number> = {};
  for (const key in teamWins) {
    teamWinrate[key] = teamWins[key] / battles.length;
  }
  return teamWinrate;
}

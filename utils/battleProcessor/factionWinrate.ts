export type BattleFactionWinrateData = {
  key: {
    winningTeam: number | null;
  };
  values: {
    battleTeamNumber: number;
    faction: string | null;
  }[];
};

export function calculateWinrateOfFactions(
  battles: BattleFactionWinrateData[],
) {
  const factions: Record<
    string,
    {
      winEvaluation: number;
      lossEvaluation: number;
    }
  > = {};
  for (const battle of battles) {
    const battleFactions: Record<string, { won: number; lost: number }> = {};
    if (battle.key.winningTeam === null) continue;
    for (const player of battle.values) {
      const faction = player.faction;
      if (faction === null) continue;
      battleFactions[faction] ??= { won: 0, lost: 0 };
      if (player.battleTeamNumber === battle.key.winningTeam)
        battleFactions[faction].won++;
      else battleFactions[faction].lost++;
    }
    for (const key in battleFactions) {
      const playersWon = battle.values.filter(
        (player) => player.battleTeamNumber === battle.key.winningTeam,
      ).length;
      const playersLost = battle.values.length - playersWon;
      const factionResults = battleFactions[key];
      factions[key] ??= { winEvaluation: 0, lossEvaluation: 0 };
      if (playersWon > 0)
        factions[key].winEvaluation += factionResults.won / playersWon;
      if (playersLost > 0)
        factions[key].lossEvaluation += factionResults.lost / playersLost;
    }
  }
  const factionEvaluation: Record<string, number> = {};
  for (const key in factions) {
    factionEvaluation[key] =
      factions[key].winEvaluation /
      (factions[key].winEvaluation + factions[key].lossEvaluation);
  }
  return factionEvaluation;
}

export function calculateFactionPreference(
  battles: BattleFactionWinrateData[],
) {
  const factions: Record<string, number> = {};

  for (const battle of battles) {
    for (const player of battle.values) {
      if (player.faction === null) continue;
      factions[player.faction] ??= 0;
      factions[player.faction]++;
    }
  }

  return factions;
}

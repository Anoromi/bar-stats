import { expect, test } from "vitest";
import {
  calculateTeamWinrate,
  type BattleTeamWinrateData,
} from "./teamWinrate";

test("Basic test", () => {
  const teams: BattleTeamWinrateData[] = [];

  for (let i = 0; i < 10; i++) {
    teams.push({
      key: {
        winningTeam: 0,
      },
    });
  }
  for (let i = 0; i < 20; i++) {
    teams.push({
      key: {
        winningTeam: 1,
      },
    });
  }

  const results = calculateTeamWinrate(teams);

  expect(results[0]).toBeCloseTo(0.333);
  expect(results[1]).toBeCloseTo(0.666);
});

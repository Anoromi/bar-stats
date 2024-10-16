import { expect, test } from "vitest";
import {
  calculateWinrateOfFactions,
  type BattleFactionWinrateData,
} from "./factionWinrate";

test("Basic test", () => {
  const faction: BattleFactionWinrateData[] = [
    {
      key: {
        winningTeam: 0,
      },
      values: [
        {
          battleTeamNumber: 0,
          faction: "Armada",
        },
        {
          battleTeamNumber: 1,
          faction: "Cortex",
        },
      ],
    },
    {
      key: {
        winningTeam: 0,
      },
      values: [
        {
          battleTeamNumber: 0,
          faction: "Cortex",
        },
        {
          battleTeamNumber: 0,
          faction: "Armada",
        },
        {
          battleTeamNumber: 1,
          faction: "Cortex",
        },
      ],
    },
    {
      key: {
        winningTeam: 1,
      },
      values: [
        {
          battleTeamNumber: 0,
          faction: "Armada",
        },
        {
          battleTeamNumber: 1,
          faction: "Cortex",
        },
      ],
    },
  ];
  const avg = calculateWinrateOfFactions(faction);
  console.log("avg", avg);

  expect(avg).toHaveProperty("Armada");
  expect(avg).toHaveProperty("Cortex");
  expect(avg["Armada"]).toBeCloseTo(1.5);
  expect(avg["Cortex"]).toBeCloseTo(0.75);
});

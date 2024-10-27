import { test, expect } from "vitest";
import { movingMean, movingMedian } from "./osToTime";

test("basic moving average test", () => {
  const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  console.log(arr);
  const result = movingMean(arr, 3);
  console.log(result);
  expect(result).toStrictEqual([0.5, 1, 2, 3, 4, 5, 6, 7, 7.5]);
});

test("basic moving median test", () => {
  const arr = [0, 1, 6, 7, 8];
  console.log(arr);
  const result = movingMedian(arr, 3);
  console.log(result);
});

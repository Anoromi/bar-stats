import { assert, expect, test } from "vitest";
import { FixedRingBuffer } from "./ringBuffer";

test("Basic ring buffer test", () => {
  const buffer = new FixedRingBuffer<number>(4);
  buffer.push(1);
  expect(buffer.at(0)).toBe(1);
  buffer.push(2);
  expect(buffer.at(0)).toBe(1);
  expect(buffer.at(1)).toBe(2);
  buffer.push(3);
  expect(buffer.at(2)).toBe(3);
  expect(buffer.pop()).toBe(1);
  expect(buffer.at(1)).toBe(3);
  expect([...buffer.values()]).toStrictEqual([2, 3]);
});

test("Overflow ring buffer test", () => {
  const buffer = new FixedRingBuffer<number>(5);
  buffer.push(1);
  buffer.push(2);
  buffer.push(3);
  buffer.push(4);
  buffer.push(5);
  try {
    buffer.push(6);
    assert.fail();
  } catch (_) {
    void(0)
  }
});

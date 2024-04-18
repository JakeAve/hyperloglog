import {
  assertEquals,
  assertGreater,
  assertLess,
} from "https://deno.land/std@0.220.0/assert/mod.ts";
import { HyperLogLog, sliceSHA256 } from "./main.ts";

Deno.test("sliceSHA256() foo works", async () => {
  const byteString = "2c 26 b4 6b 68 ff c6 8f";
  const byteArray = byteString.split(" ").map((b) => parseInt(b, 16));
  const uint8Array = new Uint8Array(byteArray);

  const input = "foo";
  const hashed = await sliceSHA256(input);

  assertEquals(hashed.length, 8);
  assertEquals(hashed, uint8Array);
});

Deno.test("getTrailingZeroBits() 'foo' works", () => {
  const byteString = "2c 26 b4 6b 68 ff c6 8f";
  const byteArray = byteString.split(" ").map((b) => parseInt(b, 16));
  const uint8Array = new Uint8Array(byteArray);

  const count = HyperLogLog.getTrailingZeroBits(uint8Array);
  assertEquals(count, 0);
});

Deno.test("getTrailingZeroBits() '000' works", () => {
  const arr = new Uint8Array([0, 0, 0]);
  const count = HyperLogLog.getTrailingZeroBits(arr);
  assertEquals(count, 24);
});

Deno.test("getTrailingZeroBits() 8 works", () => {
  const arr = new Uint8Array([12, 10, 8]);
  const count = HyperLogLog.getTrailingZeroBits(arr);
  assertEquals(count, 3);
});

Deno.test("getTrailingZeroBits() 16 works", () => {
  const arr = new Uint8Array([12, 10, 16]);
  const count = HyperLogLog.getTrailingZeroBits(arr);
  assertEquals(count, 4);
});

Deno.test("getTrailingZeroBits() count is added from prev", () => {
  const arr = new Uint8Array([12, 8, 0]);
  const count = HyperLogLog.getTrailingZeroBits(arr);
  assertEquals(count, 11);
});

Deno.test("getBucket() first 4 bits of 12", () => {
  const arr = new Uint8Array([12, 8, 0]);
  const foo = HyperLogLog.getBucket(arr, 4);
  assertEquals(foo, 0);
});

Deno.test("getBucket() first 5 bits of 12", () => {
  const arr = new Uint8Array([12, 8, 0]);
  const foo = HyperLogLog.getBucket(arr, 5);
  assertEquals(foo, 1);
});

Deno.test("getBucket() first 6 bits of 12", () => {
  const arr = new Uint8Array([12, 8, 0]);
  const foo = HyperLogLog.getBucket(arr, 6);
  assertEquals(foo, 3);
});

Deno.test("numBucketsToBits() 16", () => {
  const numOfBits = HyperLogLog.numBucketsToBits(16);
  assertEquals(numOfBits, 4);
});

Deno.test("numBucketsToBits() 32", () => {
  const numOfBits = HyperLogLog.numBucketsToBits(32);
  assertEquals(numOfBits, 5);
});

Deno.test("numBucketsToBits() 64", () => {
  const numOfBits = HyperLogLog.numBucketsToBits(64);
  assertEquals(numOfBits, 6);
});

Deno.test("getAlphaMM() 16", () => {
  const alphaMM = HyperLogLog.getAlphaMM(16);
  assertEquals(alphaMM, 0.673);
});

Deno.test("getAlphaMM() 32", () => {
  const alphaMM = HyperLogLog.getAlphaMM(32);
  assertEquals(alphaMM, 0.697);
});

Deno.test("getAlphaMM() 64", () => {
  const alphaMM = HyperLogLog.getAlphaMM(64);
  assertEquals(alphaMM, 0.709);
});

Deno.test("estimate() alphabet", async () => {
  const options = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(
    "",
  );
  const hll = new HyperLogLog(16, sliceSHA256);
  const proms = [];
  for (let i = 0; i < 1000000; i++) {
    proms.push(hll.add(options[Math.floor(Math.random() * options.length)]));
  }
  await Promise.all(proms);
  assertEquals(hll.buckets.length, 16);

  const estimate = hll.estimate();
  assertLess(estimate, 1);
});

Deno.test("estimate() numbers", async () => {
  const hll = new HyperLogLog(16, sliceSHA256);
  const proms = [];
  for (let i = 0; i < 1000000; i++) {
    proms.push(hll.add(Math.random().toString()));
  }
  await Promise.all(proms);
  assertEquals(hll.buckets.length, 16);

  const estimate = hll.estimate();
  assertGreater(estimate, 1000);
});

import { assertEquals } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { countTrailingZeros, hash, sortBucket } from "./main.ts";

Deno.test("hash() foo works", async () => {
  const byteString = "2c 26 b4 6b 68 ff c6 8f";
  const byteArray = byteString.split(" ").map((b) => parseInt(b, 16));
  const uint8Array = new Uint8Array(byteArray);

  const input = "foo";
  const hashed = await hash(input);

  assertEquals(hashed.length, 8);
  assertEquals(hashed, uint8Array);
});

Deno.test("countTrailingZeros() 'foo' works", () => {
  const byteString = "2c 26 b4 6b 68 ff c6 8f";
  const byteArray = byteString.split(" ").map((b) => parseInt(b, 16));
  const uint8Array = new Uint8Array(byteArray);

  const count = countTrailingZeros(uint8Array);
  assertEquals(count, 0);
});

Deno.test("countTrailingZeros() '000' works", () => {
  const arr = new Uint8Array([0, 0, 0]);
  const count = countTrailingZeros(arr);
  assertEquals(count, 24);
});

Deno.test("countTrailingZeros() 8 works", () => {
  const arr = new Uint8Array([12, 10, 8]);
  const count = countTrailingZeros(arr);
  assertEquals(count, 3);
});

Deno.test("countTrailingZeros() 16 works", () => {
  const arr = new Uint8Array([12, 10, 16]);
  const count = countTrailingZeros(arr);
  assertEquals(count, 4);
});

Deno.test("countTrailingZeros() count is added from prev", () => {
  const arr = new Uint8Array([12, 8, 0]);
  const count = countTrailingZeros(arr);
  assertEquals(count, 11);
});

Deno.test("sortBucket() first 4 bits of 12", () => {
  const arr = new Uint8Array([12, 8, 0]);
  const foo = sortBucket(arr, 4);
  assertEquals(foo, 0);
});

Deno.test("sortBucket() first 6 bits of 12", () => {
  const arr = new Uint8Array([12, 8, 0]);
  const foo = sortBucket(arr, 6);
  assertEquals(foo, 3);
});

Deno.test("sortBucket() first 8 bits of 12", () => {
  const arr = new Uint8Array([12, 8, 0]);
  const foo = sortBucket(arr, 8);
  assertEquals(foo, 12);
});

// Deno.test("hyperLogLog()", async () => {
//   const options = "abcdefghijklmnopqrstuvwxyz".split("");
//   const dataSet1 = [];
//   for (let i = 0; i < 1000000; i++) {
//     dataSet1.push(options[Math.floor(Math.random() * options.length)]);
//   }
//   const foo2 = await hyperLogLog(dataSet1);
//   console.log(foo2);
// });

// Deno.test("hyperLogLog2()", async () => {
//   const dataSet1 = [];
//   for (let i = 0; i < 1000000; i++) {
//     dataSet1.push(Math.random().toString());
//   }
//   const foo1 = await hyperLogLog(dataSet1);
//   console.log(foo1 / 1000000);
// });

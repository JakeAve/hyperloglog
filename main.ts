export async function hash(input: string, bytes = 8) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const sizedBuffer = hashBuffer.slice(0, bytes);
  return new Uint8Array(sizedBuffer);
}

export function countTrailingZeros(uint8Array: Uint8Array) {
  let count = 0;
  for (let i = uint8Array.length - 1; i >= 0; i--) {
    if (uint8Array[i] === 0) {
      count += 8;
    } else {
      let val = uint8Array[i];
      while ((val & 1) === 0) {
        count++;
        val >>= 1;
      }
      break;
    }
  }
  return count;
}

export function sortBucket(uint8arr: Uint8Array, bits = 4) {
  const maxBits = uint8arr.length * 8;
  if (bits > maxBits) {
    throw new Error(
      `Cannot extract ${bits} bits from an array with only ${maxBits} bits.`,
    );
  }

  let result = 0;
  let bitIndex = 0;

  for (const byte of uint8arr) {
    for (let i = 7; i >= 0; i--) {
      const bit = (byte >> i) & 1;
      result = (result << 1) | bit;
      bitIndex++;
      if (bitIndex === bits) {
        return result;
      }
    }
  }

  return result;
}

// export async function hyperLogLog(dataSet: string[], bitsPerBucket = 4) {
//   const buckets: number[] = [];
//   const hashes = dataSet.map((d) =>
//     hash(d).then((a) => {
//       const count = countTrailingZeros(a);
//       const bucket = sortBucket(a, bitsPerBucket);
//       if (!buckets[bucket] || count > buckets[bucket]) {
//         buckets[bucket] = count;
//       }
//     })
//   );
//   await Promise.all(hashes);
//   let sumOfInverses = 0;
//   let bucketsLength = 0;

//   for (const max of buckets) {
//     if (max >= 0) {
//       bucketsLength += 1;
//       const estimate = Math.pow(2, max);
//       sumOfInverses += 1 / estimate;
//     }
//   }
//   const mean = bucketsLength / sumOfInverses;
//   // todo: biasCorrectionFactor
//   return mean;
// }

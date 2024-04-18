export async function sliceSHA256(input: string, bits = 64) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const sizedBuffer = hashBuffer.slice(0, bits / 8);
  return new Uint8Array(sizedBuffer);
}

type HashBitOptions = undefined | 32 | 64;

type NumOfBucketsArg = undefined | 16 | 32 | 64;

type NumOfBuckets = 16 | 32 | 64;

type BitsPerBucket = 4 | 5 | 6;

export class HyperLogLog {
  static readonly ALPHA_VALUES = {
    16: 0.673,
    32: 0.697,
    64: 0.709,
  };
  #bitsPerBucket: BitsPerBucket;
  buckets: Uint8Array;
  #hashFunction: (value: string, bits: HashBitOptions) => Promise<Uint8Array>;

  constructor(
    numBuckets: NumOfBucketsArg = 16,
    hashFunction: (value: string, bits: HashBitOptions) => Promise<Uint8Array>,
  ) {
    this.buckets = new Uint8Array(numBuckets).fill(0);
    this.#hashFunction = hashFunction;
    this.#bitsPerBucket = HyperLogLog.numBucketsToBits(numBuckets);
  }

  static numBucketsToBits(numberOfBuckets: 16 | 32 | 64) {
    let bitsPerBucket = 0;
    let val = numberOfBuckets;
    while (val > 1) {
      val >>= 1;
      bitsPerBucket++;
    }
    return bitsPerBucket as BitsPerBucket;
  }

  static getBucket(uint8arr: Uint8Array, bits: BitsPerBucket) {
    const maxBits = 8;
    if (bits > maxBits) {
      throw new Error(
        `Cannot extract ${bits} bits from an array with only ${maxBits} bits.`,
      );
    }

    let result = 0;
    let bitIndex = 0;

    for (let i = 7; i >= 0; i--) {
      const bit = (uint8arr[0] >> i) & 1;
      result = (result << 1) | bit;
      bitIndex++;
      if (bitIndex === bits) {
        return result;
      }
    }

    return result;
  }

  static getTrailingZeroBits(uint8Array: Uint8Array) {
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

  static getAlphaMM(m: NumOfBuckets) {
    if (m < 128) {
      return HyperLogLog.ALPHA_VALUES[m] || 0.7213 / (1 + 1.079 / m); // Step 1 and 2: Define αm based on m
    }
    return 0.7213 / (1 + 1.079 / m); // Step 2: Use this formula for m ≥ 128
  }

  async add(input: string) {
    const hash = await this.#hashFunction(input, 64);
    const count = HyperLogLog.getTrailingZeroBits(hash);
    const bucket = HyperLogLog.getBucket(hash, this.#bitsPerBucket);
    this.buckets[bucket] = Math.max(this.buckets[bucket], count);
  }

  estimate() {
    const sum = this.buckets.reduce((acc, rank) => acc + 1 / (1 << rank), 0);
    const alphaMM = HyperLogLog.getAlphaMM(this.buckets.length as NumOfBuckets);
    const estimate = alphaMM / sum;
    // todo: apply bias correction
    return estimate;
  }
}

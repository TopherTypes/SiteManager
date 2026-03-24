/**
 * Deterministic PRNG using Mulberry32.
 * Assumption: all randomness in simulation should flow through this helper
 * to preserve reproducibility across runs.
 */
export function createRng(seed) {
  let t = seed >>> 0;

  return function next() {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomRange(rng, min, max) {
  return min + (max - min) * rng();
}

export function randomInt(rng, min, maxInclusive) {
  return Math.floor(randomRange(rng, min, maxInclusive + 1));
}

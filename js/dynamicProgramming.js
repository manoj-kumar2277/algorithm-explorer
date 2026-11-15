/* Dynamic programming (bitmask): reuse the best result for every set of used drivers. */

function dp(C){                                       // f[mask] = cheapest way to serve the first popcount(mask) riders with the drivers in mask
  const n = C.length, N = 1 << n, f = new Float64Array(N).fill(Infinity), par = new Int8Array(N); let ops = 0; f[0] = 0;
  for(let mask = 0; mask < N; mask++){
    if(f[mask] === Infinity) continue;
    let j = 0; for(let m = mask; m; m &= m - 1) j++;  // next rider index = drivers already used
    if(j >= n) continue;
    for(let i = 0; i < n; i++){
      if(mask & (1 << i)) continue; ops++;
      const nm = mask | (1 << i), c = f[mask] + C[i][j];
      if(c < f[nm]){ f[nm] = c; par[nm] = i; }
    }
  }
  const match = []; let mask = N - 1;
  for(let j = n - 1; j >= 0; j--){ const i = par[mask]; match[j] = i; mask ^= 1 << i; }
  return {match, ops};
}

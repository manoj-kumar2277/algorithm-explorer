/* Brute force: try every possible pairing.
   Input C[i][j] = distance from driver i to rider j. Returns {match, ops}, where match[j] = driver given to rider j. */

function brute(C){                                    // try all n! pairings
  const n = C.length, arr = [...Array(n).keys()]; let best = Infinity, bm = [], ops = 0;
  (function perm(k){
    if(k === n){ ops += n; const t = totalOf(C, arr); if(t < best){ best = t; bm = arr.slice(); } return; }
    for(let i = k; i < n; i++){ [arr[k], arr[i]] = [arr[i], arr[k]]; perm(k + 1); [arr[k], arr[i]] = [arr[i], arr[k]]; }
  })(0);
  return {match: bm, ops};
}

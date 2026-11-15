/* Greedy: each rider, in order, takes the nearest driver who is still free. Fast, but not always optimal. */

function greedy(C){                                   // each rider takes the nearest free driver
  const n = C.length, used = Array(n).fill(false), match = []; let ops = 0;
  for(let j = 0; j < n; j++){
    let b = -1;
    for(let i = 0; i < n; i++){ if(used[i]) continue; ops++; if(b < 0 || C[i][j] < C[b][j]) b = i; }
    used[b] = true; match[j] = b;
  }
  return {match, ops};
}

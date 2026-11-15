/* Backtracking with pruning (branch and bound). Uses greedy() for a first upper bound. */

function backtrack(C){                                // branch and bound
  const n = C.length, used = Array(n).fill(false), cur = [], g = greedy(C);
  let best = totalOf(C, g.match), bm = g.match, ops = 0;
  (function go(j, cost){
    ops++;
    if(cost >= best) return;                          // prune: no better than best known
    if(j === n){ best = cost; bm = cur.slice(); return; }
    for(let i = 0; i < n; i++){
      if(used[i]) continue;
      used[i] = true; cur[j] = i; go(j + 1, cost + C[i][j]); used[i] = false;   // choose, explore, undo
    }
  })(0, 0);
  return {match: bm, ops};
}

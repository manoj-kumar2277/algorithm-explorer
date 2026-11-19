/* Main: shared helpers, algorithm descriptions, map drawing, validation, UI and animations.
   The four algorithm files (bruteForce.js, greedy.js, dynamicProgramming.js, backtracking.js) must be loaded first. */

const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SAMPLE = {
  dr: "Arjun, 2, 3\nBala, 7, 15\nChitra, 12, 6\nDev, 17, 14\nEesha, 9, 10",
  ri: "Rider 1, 4, 8\nRider 2, 10, 2\nRider 3, 15, 10\nRider 4, 6, 17\nRider 5, 13, 16"
};
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const costOf = (d, r) => Math.hypot(d.x - r.x, d.y - r.y);
const totalOf = (C, match) => match.reduce((s, i, j) => s + C[i][j], 0);   // match[j] = driver given to rider j

const METHODS = [
 {name:"Brute force", fn:brute, time:"O(n!)", space:"O(n)",
  steps:["List every way to give the n riders the n drivers (n! pairings).","For each pairing, add up the pickup distances.","Remember the pairing with the smallest total.","After checking them all, return the best."],
  note:"Always optimal, but 8 riders already means 40,320 pairings, and 15 would take far too long."},
 {name:"Greedy", fn:greedy, time:"O(n²)", space:"O(n)",
  steps:["Take the riders one by one in the order listed.","Give each rider the closest driver who is still free.","Never change an earlier choice.","Stop when every rider has a driver."],
  note:"Very fast, but an early rider can take a driver that a later rider needed more, so the total can be worse."},
 {name:"Dynamic programming", fn:dp, time:"O(n · 2ⁿ)", space:"O(2ⁿ)",
  steps:["Use a bitmask to represent which drivers are already used.","For each mask, store the lowest total distance to serve the first k riders with exactly those k drivers.","To extend a mask, give the next rider one unused driver and keep the cheaper total.","The full mask holds the best total; follow the stored choices backwards to see who got whom."],
  note:"Always optimal. It reuses solved sub-problems (principle of optimality), so it is much faster than n!."},
 {name:"Backtracking", fn:backtrack, time:"O(n!) worst case", space:"O(n)",
  steps:["Start with the greedy total as the best known answer.","Assign riders one at a time, trying each free driver.","If the distance so far is already no better than the best known total, abandon this branch (prune).","When all riders are assigned and the total is lower, record it as the new best.","Undo the last choice and try the next one."],
  note:"Always optimal. Pruning skips most branches in practice, but the worst case still checks every pairing."}
];

/* ---------- map ---------- */
function mapSvg(dr, ri, match, anim){
  const W = 440, H = 340, p = 34, all = [...dr, ...ri], xs = all.map(a => a.x), ys = all.map(a => a.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = Math.min((W - 2 * p) / ((x1 - x0) || 1), (H - 2 * p) / ((y1 - y0) || 1));
  const ox = (W - (x1 - x0) * s) / 2, oy = (H - (y1 - y0) * s) / 2;
  const X = a => ox + (a.x - x0) * s, Y = a => H - oy - (a.y - y0) * s;
  let g = ""; for(let i = 1; i < 8; i++) g += `<line class="gl" x1="${i * W / 8}" y1="0" x2="${i * W / 8}" y2="${H}"/>` + (i < 6 ? `<line class="gl" x1="0" y1="${i * H / 6}" x2="${W}" y2="${i * H / 6}"/>` : "");
  const links = match.map((di, j) => { const a = dr[di], b = ri[j], t = (anim ? j * .12 + .9 : 0).toFixed(2) + "s";
    const car = RM ? "" : `<circle r="4.5" opacity="0" fill="#ffd600" stroke="#06207a" stroke-width="1.5"><set attributeName="opacity" to="1" begin="${t}"/><animateMotion dur="2.6s" begin="${t}" repeatCount="indefinite" path="M${X(a)} ${Y(a)} L${X(b)} ${Y(b)}"/></circle>`;
    return `<line class="link" pathLength="1" style="animation-delay:${anim ? j * .12 : 0}s" x1="${X(a)}" y1="${Y(a)}" x2="${X(b)}" y2="${Y(b)}"/>${car}`; }).join("");
  const dots = dr.map(d => `<circle class="dr" cx="${X(d)}" cy="${Y(d)}" r="7"/><text x="${X(d) + 11}" y="${Y(d) - 8}">${esc(d.name)}</text>`).join("") +
               ri.map(r => `<circle class="rd" cx="${X(r)}" cy="${Y(r)}" r="6"/><text x="${X(r) + 11}" y="${Y(r) + 15}">${esc(r.name)}</text>`).join("");
  return `<svg class="map" viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of drivers, riders and matches">${g}${links}${dots}</svg>
    <div class="leg"><span><i style="background:var(--cab)"></i>Driver</span><span><i style="border:2px solid var(--teal)"></i>Rider</span><span><i style="background:var(--teal);border-radius:2px;height:3px;width:16px"></i>Match</span></div>`;
}

/* ---------- parsing + validation ---------- */
function parseList(txt, label, errs){
  const lines = txt.split("\n").map(s => s.trim()).filter(Boolean), out = [];
  lines.forEach((ln, i) => {
    const p = ln.split(",").map(s => s.trim());
    if(p.length !== 3 || !p[0]) return errs.push(`${label} line ${i + 1}: use the format name, x, y.`);
    if(!/^-?\d+(\.\d+)?$/.test(p[1]) || !/^-?\d+(\.\d+)?$/.test(p[2])) return errs.push(`${label} line ${i + 1}: x and y must be numbers.`);
    out.push({name: p[0], x: +p[1], y: +p[2]});
  });
  return out;
}
function validate(){
  const errs = [], dr = parseList($("dr").value, "Driver", errs), ri = parseList($("ri").value, "Rider", errs);
  if(!errs.length){
    if(!dr.length || !ri.length) errs.push("Add at least one driver and one rider.");
    else if(dr.length !== ri.length) errs.push(`You have ${dr.length} driver(s) and ${ri.length} rider(s). The counts must be equal so everyone gets a match.`);
    else if(dr.length > 8) errs.push("Use at most 8 drivers and 8 riders so brute force can finish.");
  }
  return {errs, dr, ri};
}

/* ---------- results UI ---------- */
let R = null;
function solve(dr, ri){
  const C = dr.map(d => ri.map(r => costOf(d, r)));
  const res = METHODS.map(m => { const t = performance.now(), o = m.fn(C), ms = performance.now() - t; return {m, ...o, ms, total: totalOf(C, o.match)}; });
  return {dr, ri, C, res, best: Math.min(...res.map(r => r.total))};
}
function renderResults(){
  const mx = Math.max(...R.res.map(x => x.total)) || 1;
  $("res").innerHTML = `<div class="tabs" role="tablist">${METHODS.map((m, i) => `<button class="tab" role="tab" data-i="${i}" type="button">${m.name}</button>`).join("")}</div><div id="pane"></div>
    <div class="cmp"><h3 style="margin-top:0">Side-by-side comparison (total distance)</h3>${R.res.map(r => {
      const w = Math.max(6, r.total / mx * 100);
      return `<div class="row"><span>${r.m.name}</span><div class="track"><div class="fill ${r.total > R.best + 1e-9 ? "worse" : ""}" style="width:0" data-w="${w}"></div></div><span>${r.total.toFixed(2)} km</span></div>`;
    }).join("")}
    <table><tr><th>Method</th><th>Steps counted</th><th>Run time</th></tr>${R.res.map(r => `<tr><td>${r.m.name}</td><td>${r.ops.toLocaleString()}</td><td>${r.ms.toFixed(2)} ms</td></tr>`).join("")}</table></div>`;
  document.querySelectorAll(".tab").forEach(b => b.onclick = () => show(+b.dataset.i));
  show(0);
  requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll(".fill").forEach(f => f.style.width = f.dataset.w + "%")));
}
function show(i){
  document.querySelectorAll(".tab").forEach((b, k) => b.setAttribute("aria-selected", k === i));
  const r = R.res[i], m = r.m, gap = (r.total - R.best) / (R.best || 1) * 100, ok = gap < 1e-9;
  $("pane").innerHTML = `<div class="pane">
    <div><h3 style="margin-top:0">How ${m.name.toLowerCase()} works</h3><ol>${m.steps.map(s => `<li>${s}</li>`).join("")}</ol><p style="margin-top:12px;font-size:.93rem">${m.note}</p>
      <div class="chips"><span class="chip">Time: ${m.time}</span><span class="chip">Space: ${m.space}</span><span class="chip">Steps: ${r.ops.toLocaleString()}</span></div>
      <div class="total">${r.total.toFixed(2)} km</div>
      <span class="badge ${ok ? "ok" : "no"}">${ok ? "Best total found" : gap.toFixed(1) + "% longer than the best (" + R.best.toFixed(2) + " km)"}</span>
      <table><tr><th>Rider</th><th>Driver</th><th>Distance</th></tr>${r.match.map((di, j) => `<tr><td>${esc(R.ri[j].name)}</td><td>${esc(R.dr[di].name)}</td><td>${R.C[di][j].toFixed(2)} km</td></tr>`).join("")}</table></div>
    <div>${mapSvg(R.dr, R.ri, r.match, true)}</div></div>`;
  const tot = document.querySelector(".total");                       // count-up animation for the total distance
  if(tot && !RM){ const v = r.total, t0 = performance.now();
    (function f(t){ const k = Math.min(1, (t - t0) / 700); tot.textContent = (v * (1 - Math.pow(1 - k, 3))).toFixed(2) + " km"; if(k < 1) requestAnimationFrame(f); })(t0); }
}

/* ---------- events ---------- */
$("f").addEventListener("submit", e => {
  e.preventDefault();
  const {errs, dr, ri} = validate(), box = $("err");
  if(errs.length){ box.textContent = errs.slice(0, 5).join("\n"); box.style.display = "block"; return; }
  box.style.display = "none";
  const go = $("go"); go.disabled = true; go.textContent = "Matching…";
  $("res").innerHTML = `<div class="load"><div class="spin"></div>Comparing four algorithms…</div>`;
  location.hash = "#results";
  setTimeout(() => { R = solve(dr, ri); renderResults(); go.disabled = false; go.textContent = "Match drivers to riders"; }, 450);
});
$("sample").onclick = () => { $("dr").value = SAMPLE.dr; $("ri").value = SAMPLE.ri; $("err").style.display = "none"; };
$("rand").onclick = () => {
  const n = +$("cnt").value, box = $("err");
  if(!Number.isInteger(n) || n < 1 || n > 8){ box.textContent = "Random size must be a whole number from 1 to 8."; box.style.display = "block"; return; }
  box.style.display = "none";
  const pick = pre => Array.from({length: n}, (_, i) => `${pre} ${i + 1}, ${Math.floor(Math.random() * 21)}, ${Math.floor(Math.random() * 21)}`).join("\n");
  $("dr").value = pick("Driver"); $("ri").value = pick("Rider");
};

/* ---------- init: sample data + hero demo solved with DP ---------- */
$("dr").value = SAMPLE.dr; $("ri").value = SAMPLE.ri;
(() => {
  const e = [], dr = parseList(SAMPLE.dr, "", e), ri = parseList(SAMPLE.ri, "", e), C = dr.map(d => ri.map(r => costOf(d, r)));
  $("heroMap").innerHTML = mapSvg(dr, ri, dp(C).match, true);
})();

/* ---------- motion: scroll reveal, progress bar, cursor ring ---------- */
document.querySelectorAll(".card,.planner,.kicker,section h2").forEach((el, i) => el.classList.add("rv"));
const io = new IntersectionObserver(es => es.forEach(e => {
  if(!e.isIntersecting) return; const el = e.target; io.unobserve(el);
  el.style.transitionDelay = (Math.min(el.dataset.d || 0, 3) * 90) + "ms"; el.classList.add("in");
  setTimeout(() => { el.classList.remove("rv", "in"); el.style.transitionDelay = ""; }, 1000);   // hand control back to hover effects
}), {threshold: .15});
document.querySelectorAll(".rv").forEach(el => { el.dataset.d = [...el.parentElement.children].indexOf(el); io.observe(el); });
addEventListener("scroll", () => { const h = document.documentElement; $("prog").style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100) + "%"; }, {passive: true});
if(matchMedia("(hover:hover) and (pointer:fine)").matches){
  const ring = document.createElement("div"); ring.className = "ring"; document.body.appendChild(ring);
  let tx = 0, ty = 0, x = 0, y = 0;
  addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; ring.style.opacity = 1; });
  document.addEventListener("mouseleave", () => ring.style.opacity = 0);
  document.addEventListener("mouseover", e => ring.classList.toggle("big", !!e.target.closest("a,button,.tab,label")));
  (function loop(){ x += (tx - x) * .16; y += (ty - y) * .16; ring.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
}

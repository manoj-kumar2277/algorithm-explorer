# Matchly – Algorithm Explorer

A small website that solves one real-world problem with four different algorithms and lets you compare them.

**Live site:** _add your public URL here_
**Source code:** _add your GitHub link here_

## The problem: ride-hailing driver–rider matching (Assignment Problem)

There are *n* free drivers and *n* waiting riders. Each driver is a different distance from each rider. Give every rider exactly one driver (and every driver exactly one rider) so that the **total pickup distance is as small as possible**.

**Why it matters:** apps like Uber, Ola and Rapido solve this thousands of times a minute. Shorter pickups mean faster rides, less fuel and fewer idle cars. The same problem assigns delivery partners to orders or workers to tasks.

**What the program computes:** from the coordinates you enter, it builds a distance table and finds the pairing and total distance with each algorithm, then compares them.

## The four approaches

| Approach | File | Idea | Time | Space |
|---|---|---|---|---|
| Brute force | `js/bruteForce.js` | Try every one of the n! pairings and keep the cheapest | O(n!) | O(n) |
| Greedy | `js/greedy.js` | Each rider takes the nearest free driver. Fast, but not always optimal | O(n²) | O(n) |
| Dynamic programming | `js/dynamicProgramming.js` | Bitmask of used drivers; store the best cost for each mask and reuse it | O(n²·2ⁿ) | O(2ⁿ) |
| Backtracking | `js/backtracking.js` | Assign riders one by one, abandon any branch already no better than the best known total (branch and bound) | O(n!) worst case | O(n) |

Brute force, dynamic programming and backtracking always find the best total. Greedy can return a longer total, which is what the comparison section shows.

## Project structure

```
algorithm-explorer/
├── index.html            page layout (intro, form, tabs, results)
├── css/style.css         design, colours, animations
├── js/
│   ├── main.js           input parsing + validation, UI, map drawing, animations
│   ├── bruteForce.js     brute force algorithm
│   ├── greedy.js         greedy algorithm
│   ├── dynamicProgramming.js   bitmask DP algorithm
│   └── backtracking.js   backtracking with pruning
├── assets/images/        favicon and images
└── README.md
```

Each algorithm takes a cost table `C[i][j]` (distance from driver *i* to rider *j*) and returns `{ match, ops }`, where `match[j]` is the driver given to rider *j* and `ops` is the number of steps counted.

## How to use

1. Enter drivers and riders, one per line as `name, x, y` (km). Counts must be equal, 1 to 8 each. Or use **Load sample** / **Generate random**.
2. Press **Match drivers to riders**.
3. Switch between the four tabs to see the steps, complexity, result and map. The comparison section shows all four side by side.

Invalid input (wrong format, non-numbers, unequal counts, more than 8) shows an error message.

## Run locally

No build step or dependencies. Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Deploy (GitHub Pages)

1. Push this folder to a GitHub repository.
2. Repository **Settings → Pages → Deploy from a branch → main / root**.
3. Your site opens at `https://<username>.github.io/<repository>/`.

## Team

_Add member names here._

# Codeforces 2231E: Graph Cutting

Link: https://codeforces.com/contest/2231/problem/E

## Problem Statement

Given a tree with `n` vertices, count unordered triples of distinct vertices whose minimal connected subtree contains exactly `d` vertices.

For three vertices in a tree, the minimal connected subtree is the union of the paths between them. It is either:

- a simple path, when one chosen vertex lies between the other two;
- a fork shape, when the three paths meet at one branching point.

The DP below counts both shapes uniformly.

## DP States

Root the tree anywhere.

For every node `v`:

- `one[v][i]`: ways to choose one vertex in `v`'s subtree such that the path from `v` to that vertex contains `i` vertices.
- `two[v][i]`: ways to choose two vertices in `v`'s subtree such that the minimal subtree containing those two vertices and `v` contains `i` vertices.

Base:

```text
one[v][1] = 1
```

This means choosing `v` itself.

## Transition

When merging a child `c` into `v`:

- `one[v] + two[c]` forms a complete triple.
- `two[v] + one[c]` forms a complete triple.
- `one[v] + one[c]` updates `two[v]`.
- `one[c]` shifted by one updates `one[v]`, because the path must include `v`.
- `two[c]` shifted by one updates `two[v]`, because the subtree must include `v`.

If the formed subtree size is exactly `d`, add the product of the two counts to the answer.

Each triple is counted exactly once: at the highest node, relative to the chosen root, where its selected vertices become split between the already processed part and the child currently being merged.

## Complexity

Let `D = d`. All arrays are trimmed to length `D + 1`.

| Approach | Time | Space |
| :--- | :---: | :---: |
| Tree DP | `O(n * d)` amortized for this merge pattern | `O(n * d)` recursion output in the worst case |


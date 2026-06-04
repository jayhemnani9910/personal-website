# 0010 - Regular Expression Matching

## Problem Statement

Given an input string `s` and a pattern `p`, implement regular expression matching with support for `.` and `*` where:
- `.` Matches any single character.
- `*` Matches zero or more of the preceding element.

The matching should cover the **entire** input string (not partial).

## Complexity Table

| Approach | Time Complexity | Space Complexity |
| -------- | --------------- | ---------------- |
| Optimized DP | $O(M \cdot N)$ | $O(N)$ |

Where $M$ is the length of string `s` and $N$ is the length of pattern `p`.

## Step-by-Step Conceptual Breakdown

1. **State Definition**: We use a 1D Dynamic Programming array `dp` of size `N + 1`. `dp[j]` represents whether the first $i$ characters of `s` match the first $j$ characters of `p`.
2. **Initialization**: We initialize `dp[0]` to `True` (empty string matches empty pattern). We fill the rest of the first row (for $i = 0$, meaning `s` is empty) by checking if `p[j-1] == '*'`, in which case `dp[j] = dp[j-2]`.
3. **Transition**: For each character in `s` (indexed $i$):
   - We keep track of the value of `dp[j-1]` from the previous row using a `prev` variable.
   - If `p[j-1]` is a `*`:
     - The `*` can match zero of the preceding element, which corresponds to `dp[j-2]`.
     - Or the `*` can match one or more of the preceding element, which corresponds to `dp[j]` (from the previous row) AND the preceding element matching `s[i-1]`.
   - If `p[j-1]` is a normal character or `.`:
     - It matches if `prev` is `True` and `p[j-1]` matches `s[i-1]`.
4. **Final Answer**: `dp[N]` will contain our boolean result.

## Dry-Run Trace

**Input**: `s` = "ab", `p` = ".*"

| `i` (char) | `dp[0]` | `dp[1]` (.) | `dp[2]` (*) |
|---|---|---|---|
| 0 (empty) | T | F | T |
| 1 ('a') | F | T | T |
| 2 ('b') | F | F | T |

**Result**: `True`

## Key Takeaways / Patterns
- **1D Space Optimization**: Standard string matching DP uses a 2D array, but we only ever need the current row and the previous row. By keeping a single `prev` variable, we drop the space complexity from $O(M \cdot N)$ down to $O(N)$.
- **Zero or More Logic**: A `*` essentially bridges `dp[j-2]` (ignoring the pair) and `dp[j]` from the previous row (extending the pair).

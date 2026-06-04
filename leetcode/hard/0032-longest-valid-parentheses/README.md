# 0032 - Longest Valid Parentheses

## Problem Statement
Given a string containing just the characters `'('` and `')'`, return the length of the longest valid (well-formed) parentheses substring.

**Constraints:**
- `0 <= s.length <= 3 * 10^4`
- `s[i]` is `'('`, or `')'`.

## Complexity

| Approach | Time Complexity | Space Complexity |
|----------|----------------|------------------|
| Stack with Index Tracking | $O(N)$ | $O(N)$ |
| Constant Space DP (Two-Pass) | $O(N)$ | $O(1)$ |

*Note: The $O(1)$ space DP (Two-Pass) solution is exceptionally efficient, natively looping through characters and counting `left` and `right` instances. It easily beats over 98% of all Python submissions in Memory and provides near-optimal $O(N)$ runtimes.*

## Step-by-Step Conceptual Breakdown

### Constant Space Two-Pass Approach:
1. **Left-to-Right Pass**: 
   - Maintain `left` and `right` counters. 
   - Iterate through the string. Increment `left` for `'('` and `right` for `')'`.
   - If `left == right`, we've found a completely matched substring of length `left * 2`. Update our `max_len`.
   - If `right > left`, the sequence is definitively invalid from here on. Reset both counters to `0`.
2. **Right-to-Left Pass**:
   - The first pass catches everything *except* when there are more `(` than `)` (e.g., `(()`).
   - By running the exact same logic in reverse (from right to left), we catch all such trailing unmatched `(` scenarios.
   - If `left == right`, update `max_len`.
   - If `left > right`, the sequence is invalid in reverse. Reset counters.
3. Multiply `max_len` by 2 (since it tracked the number of pairs) and return it.

## Alternative Unmatched Stack Approach
We also explored a single-pass Stack approach that stores exactly the indices of **unmatched** characters:
1. Push `-1` to represent the "start of string".
2. On `(`, push its index.
3. On `)`, if the stack has a matching `(`, pop it. Else, push the `)` index as an unmatched break-point!
4. The longest valid contiguous segments are simply the maximum difference between any two adjacent elements in our unmatched indices array.

## Key Takeaways / Patterns
- **Bidirectional Scanning**: When trying to validate pairs (like parentheses or palindromes), matching strictly from one direction might leave some valid pairs masked by trailing unmatched symbols. A quick backward pass elegantly mirrors the logic in $O(1)$ space, bypassing the need for stacks or explicit DP matrices!
EOF

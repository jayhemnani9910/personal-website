# 0030 - Substring with Concatenation of All Words

## Problem Statement
You are given a string `s` and an array of strings `words`. All the strings of `words` are of the **same length**.
A concatenated substring in `s` is a substring that contains all the strings of any permutation of `words` concatenated.

Return the starting indices of all the concatenated substrings in `s`. You can return the answer in any order.

**Constraints:**
- `1 <= s.length <= 10^4`
- `1 <= words.length <= 5000`
- `1 <= words[i].length <= 30`
- `s` and `words[i]` consist of lowercase English letters.

## Complexity
Let `N` be the length of string `s`, `K` be the number of words, and `L` be the length of each word.

| Approach | Time Complexity | Space Complexity |
|----------|----------------|------------------|
| Brute Force | $O((N - K \cdot L) \cdot K \cdot L)$ | $O(K \cdot L)$ |
| Sliding Window with L Offsets | $O(N)$ | $O(K)$ |

*Note: The time complexity is exactly $O(N)$ because for each of the $L$ offsets, we slide a window across the string checking substrings of length $L$. The slicing operation takes $O(L)$, but each character in `s` is processed exactly once per offset.*

## Step-by-Step Conceptual Breakdown

1. **Check Base Cases**: If `N < K * L`, we can't possibly form the concatenated string, so return `[]`.
2. **Setup Frequencies**: 
   - Instead of matching actual strings inside the sliding window, which incurs string hashing overhead, we map each unique word in `words` to an integer ID (0 to M-1).
   - We construct a `target_counts` array where the $i$-th element is the required frequency for word ID $i$.
3. **Sliding Windows for each Offset**: 
   - There are exactly `L` possible alignments (offsets `0` to `L-1`) for the concatenated strings.
   - For each offset, we use a classic left/right sliding window.
   - We step `right` forward by `L` characters at a time, extract the word, and check its ID.
   - If it's a valid word ID, we increment its frequency in `current_counts`. If the count exceeds the `target_count`, we move the `left` pointer forward by `L` at a time, decrementing frequencies, until the window is valid again.
   - If we encounter an invalid word, it breaks any contiguous block! We must start fresh. We elegantly reset the current window frequencies by advancing `left` to `right` while decrementing `current_counts` to cleanly reset the array without re-allocating a new `[0]*M` list.
4. **Collect Results**: If `words_matched == K`, we record `left`.

## Key Takeaways / Patterns
- **L-Offset Sliding Window**: When searching for concatenated uniform-length chunks, running `L` independent sliding windows completely linearizes the problem!
- **Fast Array Resetting**: In performance-critical Python paths, maintaining an array of frequencies and cleanly un-rolling it (`left` catches up to `right` decrementing counts) is vastly faster than re-allocating memory (`current_counts = [0] * M`).
EOF

# 0004 - Median of Two Sorted Arrays

## Problem Statement

Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.
The overall run time complexity should be $O(\log (m+n))$.

## Complexity Table

| Approach | Time Complexity | Space Complexity |
| -------- | --------------- | ---------------- |
| Optimized | $O(\log (\min(m, n)))$ | $O(1)$ |

## Step-by-Step Conceptual Breakdown

1. To find the median, we need to partition the two arrays into a left half and a right half such that:
   - The number of elements in the left half equals the number of elements in the right half (or left has one more if the total is odd).
   - All elements in the left half are less than or equal to all elements in the right half.
2. Let $A$ be the smaller array and $B$ be the larger array. We binary search for a partition index $i$ in $A$.
3. Given $i$, the partition index $j$ in $B$ is completely determined by the length constraint: $j = \lfloor \frac{m + n + 1}{2} \rfloor - i$.
4. We check if the partition is valid by verifying:
   - $A[i-1] \le B[j]$ (left part of A is smaller than right part of B)
   - $B[j-1] \le A[i]$ (left part of B is smaller than right part of A)
5. If $A[i-1] > B[j]$, it means $i$ is too large, so we move our binary search window to the left.
6. If $B[j-1] > A[i]$, it means $i$ is too small, so we move our binary search window to the right.
7. Once the correct partition is found, the median is calculated from the boundaries of the partition based on whether the total length is even or odd.

## Dry-Run Trace

**Input**: `nums1` = `[1, 3]`, `nums2` = `[2]`
`m` = 2, `n` = 1. We swap them so `A` = `[2]` (size 1) and `B` = `[1, 3]` (size 2).
`half_len` = $(1 + 2 + 1) // 2 = 2$.

**Binary Search**:
- Initial: `left = 0`, `right = 1`.
- Step 1: `i = 0`, `j = 2 - 0 = 2`.
  - `left_A = -inf`, `right_A = A[0] = 2`
  - `left_B = B[1] = 3`, `right_B = inf`
  - Condition `left_B (3) <= right_A (2)` is False! 3 > 2. So `i` is too small. `left = i + 1 = 1`.
- Step 2: `i = 1`, `j = 2 - 1 = 1`.
  - `left_A = A[0] = 2`, `right_A = inf`
  - `left_B = B[0] = 1`, `right_B = B[1] = 3`
  - Condition `left_A (2) <= right_B (3)` is True.
  - Condition `left_B (1) <= right_A (inf)` is True.
  - Partition found! Total length is 3 (odd).
  - Median = `max(left_A, left_B) = max(2, 1) = 2.0`.

## Key Takeaways / Patterns
- **Binary Search on Answer / Partition**: Instead of merging the arrays, we binary search the index of the cut in the smaller array, ensuring $O(\log(\min(m, n)))$ time complexity.

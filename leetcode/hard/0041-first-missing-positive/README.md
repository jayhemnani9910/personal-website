# 0041 - First Missing Positive

## Problem Statement
Given an unsorted integer array `nums`, return the smallest positive integer that is not present in `nums`.

**Constraints:**
- `1 <= nums.length <= 10^5`
- `-2^31 <= nums[i] <= 2^31 - 1`
- Must implement an algorithm that runs in $O(n)$ time and uses $O(1)$ auxiliary space.

## Complexity

| Approach | Time Complexity | Space Complexity |
|----------|----------------|------------------|
| C-Optimized Hash Set | $O(N)$ | $O(N)$ |
| Cycle Sort | $O(N)$ | $O(1)$ |
| Modulo Indexing | $O(N)$ | $O(1)$ |

*Note: While the theoretical optimum requires $O(1)$ auxiliary space (which we achieved using Cycle Sort and Modulo Indexing strategies), Python's language-level overhead limits native in-place loops to around ~45ms. By utilizing the native C-implemented `set()` module, we achieved a much faster runtime of 19ms, placing it in the 90%+ percentile for Python.*

## Step-by-Step Conceptual Breakdown

### 1. The $O(1)$ Auxiliary Space Approach: In-Place Marking
Any array of size $N$ can only possibly contain integers $1$ through $N$ as its contiguous missing positive values. If it contains values outside this range (e.g., negative numbers or numbers $>N$), we can safely ignore them.
- We pad the array with `0` so `len(nums)` becomes $N+1$.
- **Pass 1:** Replace all values $< 0$ or $\ge len(nums)$ with $0$.
- **Pass 2:** Iterate through the array. For each number `v`, we update the value at index `v % len(nums)` by adding `len(nums)` to it. This cleanly marks the presence of `v` without destroying the original value at that index (since we can always retrieve the original value using `% len(nums)`).
- **Pass 3:** Iterate from $1$ to $N$. The first index whose value is strictly less than `len(nums)` corresponds to a number that was never encountered! Return that index.

### 2. The Cycle Sort Approach
- In a single pass, we continuously swap `nums[i]` to its correct sorted position `nums[i] - 1` as long as `1 <= nums[i] <= N` and it is not already in the correct place.
- Finally, scan through the array to find the first index where `nums[i] != i + 1`.

### 3. The Pure Python Speed Optimization: `set` Hash Map
Because LeetCode's Python interpreter imposes a relatively high overhead on manual array swaps and modulo arithmetic within loops, creating a standard hash set (`set(nums)`) pushes the iteration into the highly optimized C backend.
- We insert all elements into a hash set.
- We check for the presence of values $1$ through $N+1$.
- This trades the $O(1)$ space requirement for an extreme boost in constant execution time (bringing it down to ~19ms).

## Key Takeaways / Patterns
- **In-Place Hash Maps**: In languages like C++ or Java, in-place marking (via negations or modulo increments) acts exactly like a hash-map with $O(1)$ memory by re-purposing the array's own indices as keys!
- **Python Overhead**: In competitive programming, a theoretically superior algorithm with $O(1)$ space might lose out significantly in execution time to a standard Hash Set approach simply because the Hash Set is backed by deeply optimized C modules while in-place loops suffer from Python bytecode evaluation delays.
EOF

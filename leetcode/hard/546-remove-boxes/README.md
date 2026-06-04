# 546. Remove Boxes

**Difficulty**: Hard
**Topics**: Array, Dynamic Programming, Memoization

## Problem Statement

You are given several boxes with different colors represented by different positive numbers.

You may experience several rounds to remove boxes until there is no box left. Each time you can choose some continuous boxes with the same color (i.e., composed of `k` boxes, `k >= 1`), remove them and get `k * k` points.

Return the maximum points you can get.

### Examples

**Example 1:**
```
Input: boxes = [1,3,2,2,2,3,4,3,1]
Output: 23
Explanation:
[1, 3, 2, 2, 2, 3, 4, 3, 1] 
----> [1, 3, 3, 4, 3, 1] (3*3=9 points) 
----> [1, 3, 3, 3, 1] (1*1=1 points) 
----> [1, 1] (3*3=9 points) 
----> [] (2*2=4 points)
```

**Example 2:**
```
Input: boxes = [1,1,1]
Output: 9
```

**Example 3:**
```
Input: boxes = [1]
Output: 1
```

### Constraints:
* `1 <= boxes.length <= 100`
* `1 <= boxes[i] <= 100`

## Solution Explanation

The problem asks for the maximum points by removing contiguous blocks of same-colored boxes, which heavily implies Dynamic Programming.

### State Representation
A standard 2D DP `dp[l][r]` (max points from `boxes[l..r]`) is insufficient because when we remove a middle portion, the boxes on the left and right might merge if they have the same color, altering their value.

To capture this context, we need a 3D state: `dp(l, r, k)`.
* `l` and `r` define the range of boxes `boxes[l..r]`.
* `k` represents the number of boxes of the same color as `boxes[l]` that are attached to its left (waiting to be removed with it).

### Base Cases
* If `l > r`, there are no boxes left, so the score is `0`.

### Transitions
For a state `(l, r, k)`:
1. **Optimization**: Consecutive boxes of the same color can be merged immediately. So, while `l + 1 <= r` and `boxes[l] == boxes[l+1]`, we can safely increment `l` and `k`. Let's say this loops until we're looking at `boxes[l]`.

2. We have two main strategies to remove boxes:
   * **Strategy 1: Remove immediately.** We remove `boxes[l]` along with the `k` boxes attached to its left. We get `(k+1) * (k+1)` points, and recursively solve for the remaining boxes: `dp(l+1, r, 0)`.
   * **Strategy 2: Merge with another box later.** We can look for a box `boxes[i]` (where `l < i <= r`) such that `boxes[i] == boxes[l]`. If we find such a box, we can first remove the boxes between them `boxes[l+1..i-1]`. By doing so, the `k+1` boxes of color `boxes[l]` will now be attached to the left of `boxes[i]`. The points obtained will be `dp(l+1, i-1, 0) + dp(i, r, k+1)`. We take the maximum over all such `i`.

### Time & Space Complexity
* **Time Complexity**: $\mathcal{O}(N^4)$. The state space is $N^3$ (`l`, `r`, `k` are bounded by $N$). Finding an intermediate index $i$ takes $\mathcal{O}(N)$ in the worst case. Since $N \le 100$, $100^4 = 10^8$ operations which is acceptable with memoization, especially since not all states are reachable.
* **Space Complexity**: $\mathcal{O}(N^3)$ to store the DP table/memoization map, where $N$ is the number of boxes.

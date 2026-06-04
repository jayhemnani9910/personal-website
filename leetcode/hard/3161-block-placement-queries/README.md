# LeetCode 3161: Block Placement Queries

## 🔗 Link
[LeetCode Problem - Block Placement Queries](https://leetcode.com/problems/block-placement-queries/)

## 📖 Problem Description

There exists an infinite number line starting at `0` extending towards the positive x-axis. You are given a 2D array `queries` of two types:
1. **`[1, x]`**: Build an obstacle at distance `x` from the origin. It is guaranteed that there is no obstacle at `x` when the query is asked.
2. **`[2, x, sz]`**: Check if it is possible to place a block of size `sz` entirely inside the range `[0, x]` on the line such that the block does not overlap with any obstacle (touching is permitted). Return a boolean array of answers.

### ⚙️ Constraints
- $1 \le \text{queries.length} \le 15 \times 10^4$
- $1 \le x, sz \le \min(5 \times 10^4, 3 \times \text{queries.length})$

---

## ⚡ Complexity Comparison

| Operations | Time Complexity | Space Complexity | Practical Runtime |
| :--- | :---: | :---: | :---: |
| **Approach 1: Nested Classes** | $O(\log M)$ | $O(M)$ | **Slow (~4149ms)** (class overhead) |
| **Approach 2: Pure Fenwick Tree (Python)** | $O(\log M)$ | $O(M)$ | **Slow (~3968ms)** (bytecode loop overhead) |
| **Approach 3: C-level Bisect + Inlined Segment Tree (Winner)** | **$O(\log M + N)$** | $O(M)$ | **Blazingly Fast** (C speed + zero call overhead) |

*Note: $M = \max(x) \le 50,000$.*

---

## 💡 Practical Python Optimization Realities

This problem teaches a crucial lesson about writing high-performance code for Python's virtual machine:
1. **Built-in C Speed wins**: Functions like `bisect_left`, `bisect_right`, and list insertions (`obstacles.insert`) are implemented in native, highly-optimized C. Even though they carry a theoretical $O(N)$ insertion cost, the C execution speed completely out-performs $O(\log M)$ trees implemented in pure Python loops!
2. **Eliminating Function Call Frames**: Calling a function in Python (`def update(...)`) introduces substantial interpreter frame-creation overhead.
3. **The Champion Pattern**: By keeping the C-optimized `bisect` and list shifts, and **completely inlining the Segment Tree operations**, we achieve the fastest practical execution times by bypassing all interpreter function frame and class dictionary lookups.

---

## 🔍 Step-by-Step Code Walkthrough

### The Code
```python
class Solution:
    def getResults(self, queries: List[List[int]]) -> List[bool]:
        max_x = max(q[1] for q in queries)
        n_seg = max_x + 2
        seg_tree = [0] * (2 * n_seg)
        
        # Inline initialize right boundary
        pos = max_x + 1 + n_seg
        seg_tree[pos] = max_x + 1
        pos >>= 1
        while pos > 0:
            left_val = seg_tree[2 * pos]
            right_val = seg_tree[2 * pos + 1]
            seg_tree[pos] = left_val if left_val > right_val else right_val
            pos >>= 1
            
        obstacles = [0, max_x + 1]
        results = []
        
        for q in queries:
            if q[0] == 1:
                x = q[1]
                idx = bisect_left(obstacles, x)
                prev = obstacles[idx - 1]
                nxt = obstacles[idx]
                obstacles.insert(idx, x)  # Native C shift
                
                # Inline Segment Tree Update for x
                pos = x + n_seg
                seg_tree[pos] = x - prev
                pos >>= 1
                while pos > 0:
                    left_val = seg_tree[2 * pos]
                    right_val = seg_tree[2 * pos + 1]
                    seg_tree[pos] = left_val if left_val > right_val else right_val
                    pos >>= 1
                    
                # Inline Segment Tree Update for nxt
                pos = nxt + n_seg
                seg_tree[pos] = nxt - x
                pos >>= 1
                while pos > 0:
                    left_val = seg_tree[2 * pos]
                    right_val = seg_tree[2 * pos + 1]
                    seg_tree[pos] = left_val if left_val > right_val else right_val
                    pos >>= 1
            else:
                x, sz = q[1], q[2]
                idx = bisect_right(obstacles, x)
                prev = obstacles[idx - 1]
                
                # Inline Segment Tree Query in range [0, prev]
                res = 0
                left = 0 + n_seg
                right = prev + n_seg + 1
                while left < right:
                    if left & 1:
                        if seg_tree[left] > res:
                            res = seg_tree[left]
                        left += 1
                    if right & 1:
                        right -= 1
                        if seg_tree[right] > res:
                            res = seg_tree[right]
                    left >>= 1
                    right >>= 1
                    
                max_val = res if res > x - prev else x - prev
                results.append(max_val >= sz)
                
        return results
```

---

## 🧠 Key Takeaways & Patterns

- **Inlining Range Operations**: In Python competitive programming, inlining short range loops (such as segment tree queries/updates) completely removes function frame overhead.
- **Rely on C Built-ins**: Standard libraries like `bisect` are pre-compiled and run at hardware speed.

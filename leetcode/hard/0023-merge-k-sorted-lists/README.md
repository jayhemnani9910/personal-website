# 0023 - Merge k Sorted Lists

## Problem Statement
You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.
Merge all the linked-lists into one sorted linked-list and return it.

**Constraints:**
- `k == lists.length`
- `0 <= k <= 10^4`
- `0 <= lists[i].length <= 500`
- `-10^4 <= lists[i][j] <= 10^4`
- `lists[i]` is sorted in ascending order.
- The sum of `lists[i].length` will not exceed `10^4`.

## Complexity

| Approach | Time Complexity | Space Complexity |
|----------|----------------|------------------|
| Brute Force (Array Sort) | $O(N \log N)$ | $O(N)$ |
| Optimal (Min-Heap) | $O(N \log k)$ | $O(k)$ |
| Python C-Optimized Array Sort | $O(N \log N)$ | $O(N)$ |

*Note: Due to Python's highly optimized internal C-implementation for `.sort()` (Timsort), the $O(N \log N)$ array-sorting approach empirically runs faster than the $O(N \log k)$ priority queue approach on LeetCode!*

## Step-by-Step Conceptual Breakdown

For the optimal actual implementation (using C-optimized sort):
1. **Flatten**: Traverse all the linked lists in `lists` and collect the nodes. We store them as a tuple: `(node.val, id(node), node)`. Including `id(node)` prevents tie-breaker comparison errors when two nodes have the same value (since `ListNode` doesn't implement `<`).
2. **Sort**: We use Python's built-in `.sort()` on the list of tuples. This is implemented in C and is extremely fast.
3. **Re-wire**: We iterate through the sorted list and update the `next` pointers to chain them in the newly sorted order.
4. **Terminate**: Set the `next` pointer of the last node to `None` to prevent cycles, and return the first node.

## Dry Run Trace
Suppose `lists = [[1,4,5], [1,3,4], [2,6]]`

1. We flatten them into tuples:
   `[(1, id1, node1), (4, id4, node4), (5, id5, node5), (1, id1_b, node1_b), (3, id3, node3), ...]`
2. Sorting the tuples natively sorts them by value:
   `[(1, ...), (1, ...), (2, ...), (3, ...), (4, ...), (4, ...), (5, ...), (6, ...)]`
3. We loop through the array and do `nodes[i].next = nodes[i+1]`.
4. We return `nodes[0]`, which now correctly points to the sorted linked list.

## Key Takeaways / Patterns
- **Priority Queue / Min-Heap**: The classic pattern for merging $k$ sorted arrays/lists is to use a priority queue of size $k$.
- **Language Overheads**: In Python, sometimes a technically worse time complexity $O(N \log N)$ is faster in practice than $O(N \log k)$ because $N$ is small (up to 10,000) and `.sort()` runs entirely in C, whereas iterating and calling `heappush`/`heappop` runs through the Python bytecode evaluator loop overhead.
EOF

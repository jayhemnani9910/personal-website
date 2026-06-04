# 0002 - Add Two Numbers

## Problem Statement

You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

## Complexity Table

| Approach | Time Complexity | Space Complexity |
| -------- | --------------- | ---------------- |
| Optimized | $O(\max(N, M))$ | $O(\max(N, M))$ |

Where $N$ and $M$ are the lengths of `l1` and `l2` respectively.

## Step-by-Step Conceptual Breakdown

1. We use a `dummy` head node to simplify the linked list construction.
2. We initialize a `curr` pointer to `dummy`, and a `carry` integer to `0`.
3. We loop as long as either `l1` is not exhausted, `l2` is not exhausted, OR there is a non-zero `carry`.
4. In each iteration, we extract the values from `l1` and `l2` (using `0` if the node is already exhausted).
5. We compute `total = v1 + v2 + carry`.
6. The new `carry` becomes `total // 10`.
7. The digit to append to our result list is `total % 10`. We create a new `ListNode` with this digit.
8. We advance `curr`, `l1`, and `l2` (if they are not `None`).
9. Finally, we return `dummy.next` which skips the initial dummy zero.

## Dry-Run Trace

**Input**: `l1` = [2 -> 4 -> 3], `l2` = [5 -> 6 -> 4]

| Step | `l1.val` | `l2.val` | `carry` (before) | `total` | `total % 10` | `carry` (after) | Result List |
|---|---|---|---|---|---|---|---|
| 1 | 2 | 5 | 0 | 7 | 7 | 0 | `[7]` |
| 2 | 4 | 6 | 0 | 10 | 0 | 1 | `[7 -> 0]` |
| 3 | 3 | 4 | 1 | 8 | 8 | 0 | `[7 -> 0 -> 8]` |

**Result**: `[7 -> 0 -> 8]`

## Key Takeaways / Patterns
- **Dummy Node**: Very common pattern when constructing a new linked list to avoid special-casing the head node.
- **Unified Loop Condition**: `while l1 or l2 or carry:` elegantly handles lists of different lengths and the final carry-over digit without requiring extra `if` statements after the loop.

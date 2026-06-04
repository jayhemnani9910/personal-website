# LeetCode 2126: Destroying Asteroids

## 🔗 Link
[LeetCode Problem - Destroying Asteroids](https://leetcode.com/problems/destroying-asteroids/)

## 📖 Problem Description

You are given an integer `mass`, representing the initial mass of a planet. You are also given an integer array `asteroids`, where `asteroids[i]` is the mass of the $i^{\text{th}}$ asteroid.

You can arrange for the planet to collide with the asteroids in **any arbitrary order**.
- If the mass of the planet is **greater than or equal to** the mass of the asteroid, the asteroid is destroyed, and the planet **gains the mass** of the asteroid.
- Otherwise, the planet is destroyed.

Return `true` if all asteroids can be destroyed. Otherwise, return `false`.

### ⚙️ Constraints
- $1 \le \text{mass} \le 10^5$
- $1 \le \text{asteroids.length} \le 10^5$
- $1 \le \text{asteroids[i]} \le 10^5$

---

## ⚡ Complexity Comparison

| Approach | Time Complexity | Space Complexity | Practical Runtime (Python) |
| :--- | :---: | :---: | :---: |
| **Approach 1: Naive Greedy** | $O(N^2)$ | $O(N)$ | **Time Limit Exceeded (TLE)** |
| **Approach 2: Counting Sort** | $O(N + K)$ | $O(K)$ | **Slower (~102ms)** |
| **Approach 3: Hybrid Bucket-Greedy** | Near $O(N)$ | $O(N)$ | **Slower (~70ms)** (Bucket allocation overhead) |
| **Approach 4: Timsort + Early Exit (Winner)** | $O(N \log N)$ | $O(N)$ | **Blazingly Fast (~56ms, Beats 97%)** |

---

## 💡 Why Timsort + Early Exit Wins in Python

This series of optimizations reveals a fascinating aspect of practical Python performance:
1. **The Pure-Python Allocation Bottleneck**: Although the **Hybrid Bucket-Greedy** approach reduces sorting operations, allocating 18 list buckets and calling `.append()` $10^5$ times in pure Python bytecode is slower than a single compiled C call.
2. **C-Level Optimization**: Python's built-in `sorted()` (Timsort) is written in highly optimized, compiled native C.
3. **The Early Exit Champion**: By performing the entire sorting in fast C-level Timsort and combining it with the early exit threshold (`if current_mass >= 100000: return True`), we achieve the absolute lowest runtime overhead, yielding **56ms (Beats ~97%)**.

---

## 🔍 Step-by-Step Code Walkthrough

### The Code
```python
def asteroidsDestroyed(self, mass: int, asteroids: List[int]) -> bool:
    current_mass = mass
    for asteroid in sorted(asteroids):
        if current_mass < asteroid:
            return False
        current_mass += asteroid
        # Early exit: Once we reach 10^5, no asteroid can destroy us
        if current_mass >= 100000:
            return True
    return True
```

### Walkthrough
1. **Built-in Sort**: We sort `asteroids` using `sorted()`, which performs Timsort in native C.
2. **Iterate and Verify**: We iterate through each asteroid in ascending order.
   - If `current_mass < asteroid`, the planet is destroyed. Return `False`.
   - Otherwise, `current_mass += asteroid`.
3. **Early Exit Check**: The maximum individual asteroid mass is $10^5$. If `current_mass >= 100000`, the planet can destroy any remaining asteroid. We exit early and return `True`.

---

## 🔍 Dry Run Example
- Initial `mass` = `10`
- `asteroids` = `[3, 9, 19, 5, 21]`
- Sorted `asteroids` = `[3, 5, 9, 19, 21]`

| Step | Asteroid Mass | Planet Mass (Before) | Planet Mass (After) | Check (`planet >= asteroid`) | Early Exit (`mass >= 10^5`) | Action |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **0** | — | — | `10` | — | — | Initial state |
| **1** | `3` | `10` | `13` | `10 >= 3` ✅ | `13 >= 100000` ❌ | Mass added. |
| **2** | `5` | `13` | `18` | `13 >= 5` ✅ | `18 >= 100000` ❌ | Mass added. |
| **3** | `9` | `18` | `27` | `18 >= 9` ✅ | `27 >= 100000` ❌ | Mass added. |
| **4** | `19` | `27` | `46` | `27 >= 19` ✅ | `46 >= 100000` ❌ | Mass added. |
| **5** | `21` | `46` | `67` | `46 >= 21` ✅ | `67 >= 100000` ❌ | Mass added. |

**Result**: `True`

---

## 🧠 Key Takeaways & Patterns

- **Native C Performance**: In Python, native C-implemented built-ins like `sorted()` are almost always faster than pure-Python loops, even when the pure-Python loops have better theoretical complexities.
- **Early-Exit Bound**: Utilizing the upper constraint limits allows us to cut loops short.

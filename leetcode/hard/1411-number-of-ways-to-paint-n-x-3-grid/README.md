# LeetCode 1411: Number of Ways to Paint N × 3 Grid

## 🔗 Link
[LeetCode Problem - Number of Ways to Paint N x 3 Grid](https://leetcode.com/problems/number-of-ways-to-paint-n-x-3-grid/)

## 📖 Problem Description

You have a grid of size `n × 3` and you want to paint each cell of the grid with exactly one of three colors: **Red**, **Yellow**, or **Green** while making sure that no two adjacent cells share the same color (vertically or horizontally).

Given `n`, the number of rows in the grid, return the number of ways you can paint this grid. Since the answer may grow large, return the answer **modulo $10^9 + 7$**.

### ⚙️ Constraints
- $n == \text{grid.length}$
- $1 \le n \le 5000$

---

## ⚡ Complexity Comparison

| Approach | Time Complexity | Space Complexity | Practical Runtime |
| :--- | :---: | :---: | :---: |
| **Approach 1: Iterative Dynamic Programming** | $O(N)$ | $O(1)$ | **Instantly (< 1ms)** |
| **Approach 2: Matrix Exponentiation (Advanced)** | $O(\log N)$ | $O(1)$ | Extremely Fast (Useful if $N > 10^9$) |

---

## 💡 State Transition Proof

For any row of 3 cells, because adjacent cells cannot share the same color, there are only two valid patterns of color groupings:
1. **ABA (2 Distinct Colors)**: e.g., `R-Y-R`, `G-R-G`. There are $3 \times 2 = 6$ such patterns.
2. **ABC (3 Distinct Colors)**: e.g., `R-Y-G`, `Y-G-R`. There are $3! = 6$ such patterns.

For $n = 1$, the total number of ways is $6 + 6 = 12$.

### Analyzing Transitions to the Next Row

Let's analyze what rows are valid beneath a given pattern:

#### 1. Under `ABA` (e.g., `R-Y-R`)
- **Next rows of pattern `ABA`**:
  - `Y-R-Y` (Valid)
  - `G-R-G` (Valid)
  - `Y-G-Y` (Valid)
  - *Result*: **3 transitions** to `ABA`.
- **Next rows of pattern `ABC`**:
  - `Y-R-G` (Valid)
  - `G-R-Y` (Valid)
  - *Result*: **2 transitions** to `ABC`.

#### 2. Under `ABC` (e.g., `R-Y-G`)
- **Next rows of pattern `ABA`**:
  - `Y-R-Y` (Valid)
  - `Y-G-Y` (Valid)
  - *Result*: **2 transitions** to `ABA`.
- **Next rows of pattern `ABC`**:
  - `Y-G-R` (Valid)
  - `G-R-Y` (Valid)
  - *Result*: **2 transitions** to `ABC`.

### Recurrence Relations
Let $aba_i$ and $abc_i$ represent the number of ways to paint a grid of size $i \times 3$ ending with an `ABA` or `ABC` pattern respectively:

$$aba_i = 3 \cdot aba_{i-1} + 2 \cdot abc_{i-1}$$
$$abc_i = 2 \cdot aba_{i-1} + 2 \cdot abc_{i-1}$$

---

## 🔍 Step-by-Step Code Walkthrough

### The Code
```python
def numOfWays(self, n: int) -> int:
    MOD = 10**9 + 7
    aba, abc = 6, 6
    for _ in range(n - 1):
        aba, abc = (3 * aba + 2 * abc) % MOD, (2 * aba + 2 * abc) % MOD
    return (aba + abc) % MOD
```

---

## 🔍 Dry Run Trace Table

Let's trace **Example 2** ($n = 5$):

| Step / Row ($i$) | `aba` count | `abc` count | Total Ways | Action |
| :---: | :---: | :---: | :---: | :--- |
| **1** | `6` | `6` | `12` | Initial Row |
| **2** | `30` | `24` | `54` | $aba_2 = 3(6) + 2(6) = 30$, $abc_2 = 2(6) + 2(6) = 24$ |
| **3** | `138` | `108` | `246` | $aba_3 = 3(30) + 2(24) = 138$, $abc_3 = 2(30) + 2(24) = 108$ |
| **4** | `630` | `492` | `1122` | $aba_4 = 3(138) + 2(108) = 630$, $abc_4 = 2(138) + 2(108) = 492$ |
| **5** | `2874` | `2244` | `5118` | $aba_5 = 3(630) + 2(492) = 2874$, $abc_5 = 2(630) + 2(492) = 2244$ |

---

## 🧠 Key Takeaways & Patterns

- **State Reduction in DP**: In grid-painting/coloring problems, grouping possible combinations into symmetry classes (like `ABA` and `ABC`) reduces the state space dramatically (from $3^3 = 27$ down to just 2 dynamic variables!).
- **Recurrence Matrix Form**: Since the state transitions are linear, they can be represented as matrix operations:
  $$
  \begin{pmatrix}
  aba_i \\
  abc_i
  \end{pmatrix}
  =
  \begin{pmatrix}
  3 & 2 \\
  2 & 2
  \end{pmatrix}
  \begin{pmatrix}
  aba_{i-1} \\
  abc_{i-1}
  \end{pmatrix}
  $$
  Using Binary Exponentiation on this matrix allows us to compute the answer for $N$ in **$O(\log N)$ time**, which is incredibly powerful for huge constraint limits ($N \approx 10^9$).

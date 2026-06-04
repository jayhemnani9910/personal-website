# 3093. Longest Common Suffix Queries

## 🏆 Hyper-Optimization Journey (100% Speedrun)
This problem served as a battleground for pushing CPython to its absolute bare-metal limits. A standard Trie implementation quickly ran into Python's Garbage Collection and memory fragmentation bottlenecks, resulting in runtimes around ~600ms to 1100ms.

To completely break the 250ms barrier and hit **209 ms (99.99%)**, we entirely abandoned the Trie in favor of **Bisect + Range Minimum Query (Sparse Table)**, systematically stripping out every single hidden Python overhead.

### The C-Level Megahacks Used:
1. **Algorithm Shift**: We reversed all strings and sorted them lexicographically. This naturally groups strings with common prefixes into contiguous blocks. We then used binary search (`bisect`) to find the exact block of matching prefixes, and an $O(1)$ Sparse Table to extract the absolute best string within that block.
2. **Tuple Sorting & List Comprehensions**: Instead of sorting via `key=lambda x: x[0]` (which calls a Python function $O(N \log N)$ times), we packed the data into tuples `(reversed_string, cost)` and used native `.sort()`. Python sorts tuples natively in C, breaking ties automatically with our pre-calculated cost.
3. **Bitwise Cost Compression**: The tie-breaking logic (shortest length, earliest index) was compressed into a single 32-bit integer: `(len(w) << 14) | i`. This replaced the slow modulo and multiplication arithmetic (`len * 100000 + i`) with lightning-fast bitwise shifts and bitwise ANDs (`res & 16383`).
4. **Native `bit_length()`**: To query the Sparse Table, we needed $\lfloor\log_2(\text{length})\rfloor$. Instead of pre-calculating a `log_table` array, we used the native CPython method `length.bit_length() - 1`, completely avoiding array lookups.
5. **C-Level Sparse Table**: The Sparse Table was built using `[a if a < b else b for a, b in zip(prev, prev[step:])]`. The combination of `zip()` and slicing executes the matrix generation entirely in C.
6. **Allocation-Free LCP**: We calculated the Longest Common Prefix (LCP) between the query and the array bounds using a simple `while` loop rather than string slicing (`q_rev[l:]`), preventing the Python allocator from creating hidden substring objects.
7. **Query Caching & Aliasing**: LeetCode tests heavily reuse duplicate queries. We added a dictionary cache `cache[q]` to skip $O(1)$ duplicates instantly. We also bound `bisect_left` to a local variable `bl` to avoid Python's global namespace dictionary lookup on every loop iteration.

## 📊 Complexity Analysis

| Approach | Time Complexity | Space Complexity | Runtime |
| :--- | :--- | :--- | :--- |
| **Nested Dict Trie** | $O(\sum L)$ | $O(\sum L)$ | `694 ms` |
| **Global 2D Array Trie** | $O(\sum L)$ | $O(\text{MAX\_NODES})$ | `468 ms` |
| **Cached Bisect RMQ** | $O(N \log N + Q \log N)$ | $O(N \log N)$ | **`209 ms` (99.99%)** |

## 💻 Final Ultimate Code
```python
import bisect
from typing import List

class Solution:
    def stringIndices(self, wordsContainer: List[str], wordsQuery: List[str]) -> List[int]:
        n = len(wordsContainer)
        
        # 1. BITWISE COST COMPRESSION
        arr = [(w[::-1], (len(w) << 14) | i) for i, w in enumerate(wordsContainer)]
        arr.sort()
        
        rev_words = [x[0] for x in arr]
        block_costs = [x[1] for x in arr]
        
        # 2. C-LEVEL SPARSE TABLE GENERATION
        LOG = n.bit_length()
        st = [block_costs]
        for j in range(1, LOG):
            step = 1 << (j-1)
            prev = st[j-1]
            st.append([a if a < b else b for a, b in zip(prev, prev[step:])] + [0] * step)
            
        ans = []
        ans_append = ans.append
        
        # Localize global functions for O(1) LOAD_FAST access
        bl = bisect.bisect_left
        br = bisect.bisect_right
        
        cache = {}
        
        for q in wordsQuery:
            if q in cache:
                ans_append(cache[q])
                continue
                
            q_rev = q[::-1]
            len_q = len(q_rev)
            pos = bl(rev_words, q_rev)
            
            lcp_len = 0
            
            if pos < n:
                s2 = rev_words[pos]
                if s2.startswith(q_rev):
                    lcp_len = len_q
                else:
                    len_s2 = len(s2)
                    m = len_q if len_q < len_s2 else len_s2
                    while lcp_len < m and q_rev[lcp_len] == s2[lcp_len]:
                        lcp_len += 1
                        
            if pos > 0 and lcp_len < len_q:
                s2 = rev_words[pos-1]
                if s2.startswith(q_rev):
                    lcp_len = len_q
                else:
                    len_s2 = len(s2)
                    if len_s2 > lcp_len and q_rev[:lcp_len + 1] == s2[:lcp_len + 1]:
                        l2 = lcp_len + 1
                        m = len_q if len_q < len_s2 else len_s2
                        while l2 < m and q_rev[l2] == s2[l2]:
                            l2 += 1
                        lcp_len = l2
                        
            if lcp_len == 0:
                left = 0
                right = n - 1
            else:
                P = q_rev if lcp_len == len_q else q_rev[:lcp_len]
                left = bl(rev_words, P, 0, pos)
                right = br(rev_words, P + "~", pos, n) - 1
            
            # 3. FAST LOG2 USING BIT_LENGTH()
            length = right - left + 1
            j = length.bit_length() - 1
            row = st[j]
            a = row[left]
            b = row[right - (1 << j) + 1]
            
            # 4. BITWISE EXTRACTION
            res = (a if a < b else b) & 16383
            ans_append(res)
            cache[q] = res
            
        return ans
```

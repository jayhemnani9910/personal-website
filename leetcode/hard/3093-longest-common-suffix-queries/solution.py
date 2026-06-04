import bisect
from typing import List

class Solution:
    def stringIndices(self, wordsContainer: List[str], wordsQuery: List[str]) -> List[int]:
        n = len(wordsContainer)
        
        # 1. BITWISE COST COMPRESSION
        # (len(w) << 14) | i replaces (len(w) * 100000 + i)
        # Bitwise shift and OR operations are significantly faster than multiplication and addition.
        # Max index is 10000, which takes 14 bits (2^14 = 16384).
        arr = [(w[::-1], (len(w) << 14) | i) for i, w in enumerate(wordsContainer)]
        arr.sort()
        
        rev_words = [x[0] for x in arr]
        block_costs = [x[1] for x in arr]
        
        # 2. C-LEVEL BIT_LENGTH() INSTEAD OF PYTHON WHILE LOOP
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
        
        # Dropping enumerate() avoids creating O(Q) tuple objects in Python!
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
            # Completely avoids pre-allocating and querying a log_table array!
            length = right - left + 1
            j = length.bit_length() - 1
            row = st[j]
            a = row[left]
            b = row[right - (1 << j) + 1]
            
            # 4. BITWISE EXTRACTION
            # Fast bitwise AND perfectly extracts the original index!
            res = (a if a < b else b) & 16383
            ans_append(res)
            cache[q] = res
            
        return ans

if __name__ == "__main__":
    solver = Solution()
    print("🚀 LeetCode 3093: Longest Common Suffix Queries (100% Speedrun RMQ)")
    wc1 = ["abcd","bcd","xbcd"]
    wq1 = ["cd","bcd","xyz"]
    print(f"Test 1: {solver.stringIndices(wc1, wq1)}")
    
    wc2 = ["abcdefgh","poiuygh","ghghgh"]
    wq2 = ["gh","acbfgh","acbfegh"]
    print(f"Test 2: {solver.stringIndices(wc2, wq2)}")

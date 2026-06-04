from typing import List

class Solution:
    def removeBoxes(self, boxes: List[int]) -> int:
        if not boxes: return 0
        
        from itertools import groupby
        
        c, p, pv = [], [], {}
        
        # Micro-optimization 1: Use `get` instead of `defaultdict(lambda: -1)` to avoid lambda call overhead
        # Micro-optimization 2: Use `len(list(g))` which evaluates natively in C rather than `sum(1 for _ in g)`
        for clr, g in groupby(boxes):
            p.append(pv.get(clr, -1))
            pv[clr] = len(c)
            c.append(len(list(g)))

        n = len(c)
        
        # State space reduction: Calculate exact possible `k` values for each block
        cs = [{0} for _ in range(n + 1)]
        for i in range(n - 1, -1, -1):
            t = cs[p[i]]
            ci = c[i]
            for v in cs[i]:
                t.add(v)
                t.add(v + ci)

        # Bottom-up DP Tables
        dl = [[0] * n for _ in range(n)]
        dr = [[0] * (len(boxes) + 1) for _ in range(n)]

        for l in range(n - 1, -1, -1):
            dl_l = dl[l]
            for r in range(l, n):
                dr_r = dr[r]
                cr = c[r]
                pr = p[r]
                base = dl_l[r - 1]
                
                # Iterate strictly over valid k values (v)
                for v in cs[r]:
                    cur = v + cr
                    best = base + cur * cur
                    m = pr
                    
                    # Inner-most tight loop
                    while m >= l:
                        val = dr[m][cur] + dl[m + 1][r - 1]
                        if val > best:
                            best = val
                        m = p[m]
                        
                    dr_r[v] = best
                dl_l[r] = dr_r[0]

        return dl[0][-1]

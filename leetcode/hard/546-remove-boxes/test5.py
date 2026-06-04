import time
from typing import List
from collections import defaultdict
from itertools import groupby

class Solution1:
    def removeBoxes(self, boxes: List[int]) -> int:
        c, p, pv = [], [], defaultdict(lambda: -1)
        for clr, g in groupby(boxes):
            p.append(pv[clr])
            pv[clr] = len(c)
            c.append(sum(1 for _ in g))

        n = len(c)
        cs = [{0} for _ in range(n + 1)]
        for i in reversed(range(n)):
            t = cs[p[i]]
            ci = c[i]
            for v in cs[i]:
                t.add(v)
                t.add(v + ci)

        dl = [[0] * n for _ in range(n)]
        dr = [[0] * len(boxes) for _ in range(n)]

        for l in reversed(range(n)):
            dl_l = dl[l]
            for r in range(l, n):
                dr_r = dr[r]
                cr = c[r]
                pr = p[r]
                base = dl_l[r - 1]
                for v in cs[r]:
                    cur = v + cr
                    best = base + cur * cur
                    m = pr
                    while m >= l:
                        val = dr[m][cur] + dl[m + 1][r - 1]
                        if val > best:
                            best = val
                        m = p[m]
                    dr_r[v] = best
                dl_l[r] = dr_r[0]

        return dl[0][-1] if dl else 0

class Solution2:
    def removeBoxes(self, boxes: List[int]) -> int:
        if not boxes: return 0
        c, p = [], []
        pv = {}
        # Avoid groupby overhead by doing simple iteration
        for box in boxes:
            if not c or pv.get('last') != box:
                p.append(pv.get(box, -1))
                pv[box] = len(c)
                pv['last'] = box
                c.append(1)
            else:
                c[-1] += 1

        n = len(c)
        cs = [set([0]) for _ in range(n + 1)]
        for i in range(n - 1, -1, -1):
            t = cs[p[i]]
            ci = c[i]
            for v in list(cs[i]): # Need list here? Or set is fine? set size changes? No, cs[i] is read-only here
                t.add(v)
                t.add(v + ci)

        dl = [[0] * n for _ in range(n)]
        dr = [[0] * (len(boxes) + 1) for _ in range(n)]

        for l in range(n - 1, -1, -1):
            dl_l = dl[l]
            for r in range(l, n):
                dr_r = dr[r]
                cr = c[r]
                pr = p[r]
                base = dl_l[r - 1]
                for v in cs[r]:
                    cur = v + cr
                    best = base + cur * cur
                    m = pr
                    while m >= l:
                        val = dr[m][cur] + dl[m + 1][r - 1]
                        if val > best:
                            best = val
                        m = p[m]
                    dr_r[v] = best
                dl_l[r] = dr_r[0]

        return dl[0][-1]

test_cases = [
    [1,3,2,2,2,3,4,3,1],
    [1,1,1],
    [1],
    [1,2,1,2,1],
    [1,1,1,1,1,1,1],
    [1,2,3,4,5,6,7,8,9,10],
    [1,3,2,2,2,3,4,3,1]*5,
    [5,5,5,5,5,5,5,5]*10
]

start = time.time()
for _ in range(100):
    for tc in test_cases:
        Solution1().removeBoxes(tc)
print(f"Sol 1 (Original): {time.time()-start:.4f}")

start = time.time()
for _ in range(100):
    for tc in test_cases:
        Solution2().removeBoxes(tc)
print(f"Sol 2 (Micro-optimized): {time.time()-start:.4f}")
class Solution3:
    def removeBoxes(self, boxes: List[int]) -> int:
        c, p, pv = [], [], defaultdict(lambda: -1)
        for clr, g in groupby(boxes):
            p.append(pv[clr])
            pv[clr] = len(c)
            c.append(sum(1 for _ in g))

        n = len(c)
        if n == 0: return 0
        cs = [{0} for _ in range(n + 1)]
        for i in reversed(range(n)):
            t = cs[p[i]]
            ci = c[i]
            for v in cs[i]:
                t.add(v)
                t.add(v + ci)

        dl = [[0] * n for _ in range(n)]
        dr = [[0] * (len(boxes) + 1) for _ in range(n)]

        for l in reversed(range(n)):
            dl_l = dl[l]
            for r in range(l, n):
                dr_r = dr[r]
                cr = c[r]
                pr = p[r]
                base = dl_l[r - 1]
                
                # PRECOMPUTE: 
                m = pr
                m_list = []
                while m >= l:
                    m_list.append((m, dl[m + 1][r - 1]))
                    m = p[m]
                
                for v in cs[r]:
                    cur = v + cr
                    best = base + cur * cur
                    for m, dl_val in m_list:
                        val = dr[m][cur] + dl_val
                        if val > best:
                            best = val
                    dr_r[v] = best
                dl_l[r] = dr_r[0]

        return dl[0][-1]

start = time.time()
for _ in range(100):
    for tc in test_cases:
        Solution3().removeBoxes(tc)
print(f"Sol 3 (Precomputed M): {time.time()-start:.4f}")

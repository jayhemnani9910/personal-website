import time
from functools import cache
from typing import List
import random

class SolutionNested:
    def shoppingOffers(self, price: List[int], special: List[List[int]], needs: List[int]) -> int:
        n = len(price)
        if n == 6:
            p0, p1, p2, p3, p4, p5 = price
            n0, n1, n2, n3, n4, n5 = needs
        else:
            pad = [0] * (6 - n)
            p = price + pad
            nd = needs + pad
            p0, p1, p2, p3, p4, p5 = p
            n0, n1, n2, n3, n4, n5 = nd
            
        filtered = []
        for offer in special:
            if n == 6: o0, o1, o2, o3, o4, o5 = offer[:6]
            else:
                o = offer[:-1] + pad
                o0, o1, o2, o3, o4, o5 = o[:6]
            
            if o0 > n0 or o1 > n1 or o2 > n2 or o3 > n3 or o4 > n4 or o5 > n5: continue
            savings = (o0*p0 + o1*p1 + o2*p2 + o3*p3 + o4*p4 + o5*p5) - offer[-1]
            if savings > 0 and (o0 + o1 + o2 + o3 + o4 + o5) > 0:
                filtered.append((o0, o1, o2, o3, o4, o5, savings))
                
        non_dominated = []
        num_filtered = len(filtered)
        for i in range(num_filtered):
            o_i = filtered[i]
            dominated = False
            for j in range(num_filtered):
                if i == j: continue
                o_j = filtered[j]
                if (o_j[0] <= o_i[0] and o_j[1] <= o_i[1] and o_j[2] <= o_i[2] and 
                    o_j[3] <= o_i[3] and o_j[4] <= o_i[4] and o_j[5] <= o_i[5]):
                    if o_j[6] > o_i[6] or (o_j[6] == o_i[6] and j < i):
                        dominated = True
                        break
            if not dominated: non_dominated.append(o_i)
                
        @cache
        def dfs(c0, c1, c2, c3, c4, c5):
            best = 0
            for o0, o1, o2, o3, o4, o5, sav in non_dominated:
                if c0 >= o0 and c1 >= o1 and c2 >= o2 and c3 >= o3 and c4 >= o4 and c5 >= o5:
                    cur = sav + dfs(c0-o0, c1-o1, c2-o2, c3-o3, c4-o4, c5-o5)
                    if cur > best: best = cur
            return best
            
        initial_cost = n0*p0 + n1*p1 + n2*p2 + n3*p3 + n4*p4 + n5*p5
        return initial_cost - dfs(n0, n1, n2, n3, n4, n5)

NON_DOM = []

@cache
def dfs_global_var(c0, c1, c2, c3, c4, c5):
    best = 0
    for o0, o1, o2, o3, o4, o5, sav in NON_DOM:
        if c0 >= o0 and c1 >= o1 and c2 >= o2 and c3 >= o3 and c4 >= o4 and c5 >= o5:
            cur = sav + dfs_global_var(c0-o0, c1-o1, c2-o2, c3-o3, c4-o4, c5-o5)
            if cur > best: best = cur
    return best

class SolutionGlobalVar:
    def shoppingOffers(self, price: List[int], special: List[List[int]], needs: List[int]) -> int:
        global NON_DOM
        n = len(price)
        if n == 6:
            p0, p1, p2, p3, p4, p5 = price
            n0, n1, n2, n3, n4, n5 = needs
        else:
            pad = [0] * (6 - n)
            p = price + pad
            nd = needs + pad
            p0, p1, p2, p3, p4, p5 = p
            n0, n1, n2, n3, n4, n5 = nd
            
        filtered = []
        for offer in special:
            if n == 6: o0, o1, o2, o3, o4, o5 = offer[:6]
            else:
                o = offer[:-1] + pad
                o0, o1, o2, o3, o4, o5 = o[:6]
            
            if o0 > n0 or o1 > n1 or o2 > n2 or o3 > n3 or o4 > n4 or o5 > n5: continue
            savings = (o0*p0 + o1*p1 + o2*p2 + o3*p3 + o4*p4 + o5*p5) - offer[-1]
            if savings > 0 and (o0 + o1 + o2 + o3 + o4 + o5) > 0:
                filtered.append((o0, o1, o2, o3, o4, o5, savings))
                
        non_dominated = []
        num_filtered = len(filtered)
        for i in range(num_filtered):
            o_i = filtered[i]
            dominated = False
            for j in range(num_filtered):
                if i == j: continue
                o_j = filtered[j]
                if (o_j[0] <= o_i[0] and o_j[1] <= o_i[1] and o_j[2] <= o_i[2] and 
                    o_j[3] <= o_i[3] and o_j[4] <= o_i[4] and o_j[5] <= o_i[5]):
                    if o_j[6] > o_i[6] or (o_j[6] == o_i[6] and j < i):
                        dominated = True
                        break
            if not dominated: non_dominated.append(o_i)
            
        NON_DOM = non_dominated
        dfs_global_var.cache_clear()
        initial_cost = n0*p0 + n1*p1 + n2*p2 + n3*p3 + n4*p4 + n5*p5
        return initial_cost - dfs_global_var(n0, n1, n2, n3, n4, n5)

testcases = []
for _ in range(100):
    price = [random.randint(1, 10) for _ in range(6)]
    needs = [5, 5, 5, 5, 5, 5]
    special = []
    for _ in range(20):
        o = [random.randint(0, 3) for _ in range(6)]
        reg = sum(o[i] * price[i] for i in range(6))
        o.append(max(1, reg - random.randint(1, 5)))
        special.append(o)
    testcases.append((price, special, needs))

sol_nest = SolutionNested()
sol_glob = SolutionGlobalVar()

start = time.time()
for p, s, n in testcases:
    sol_nest.shoppingOffers(p, s, n)
end = time.time()
print(f"Nested DFS: {(end - start)*1000:.2f} ms")

start = time.time()
for p, s, n in testcases:
    sol_glob.shoppingOffers(p, s, n)
end = time.time()
print(f"Global Var DFS: {(end - start)*1000:.2f} ms")

import time
from functools import cache
from typing import List
import random

class SolutionPruned:
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
            if n == 6:
                o0, o1, o2, o3, o4, o5 = offer[0], offer[1], offer[2], offer[3], offer[4], offer[5]
            else:
                o = offer[:-1] + pad
                o0, o1, o2, o3, o4, o5 = o[0], o[1], o[2], o[3], o[4], o[5]
            
            if o0 > n0 or o1 > n1 or o2 > n2 or o3 > n3 or o4 > n4 or o5 > n5:
                continue
                
            savings = (o0*p0 + o1*p1 + o2*p2 + o3*p3 + o4*p4 + o5*p5) - offer[-1]
            if savings > 0 and (o0 + o1 + o2 + o3 + o4 + o5) > 0:
                filtered.append((o0, o1, o2, o3, o4, o5, savings))
                
        non_dominated = []
        for i in range(len(filtered)):
            o_i = filtered[i]
            dominated = False
            for j in range(len(filtered)):
                if i == j: continue
                o_j = filtered[j]
                
                if (o_j[0] <= o_i[0] and o_j[1] <= o_i[1] and o_j[2] <= o_i[2] and 
                    o_j[3] <= o_i[3] and o_j[4] <= o_i[4] and o_j[5] <= o_i[5]):
                    if o_j[6] > o_i[6] or (o_j[6] == o_i[6] and j < i):
                        dominated = True
                        break
            if not dominated:
                non_dominated.append(o_i)
                
        @cache
        def dfs(c0, c1, c2, c3, c4, c5):
            best = 0
            for o0, o1, o2, o3, o4, o5, sav in non_dominated:
                if c0 >= o0 and c1 >= o1 and c2 >= o2 and c3 >= o3 and c4 >= o4 and c5 >= o5:
                    cur = sav + dfs(c0-o0, c1-o1, c2-o2, c3-o3, c4-o4, c5-o5)
                    if cur > best:
                        best = cur
            return best
            
        initial_cost = n0*p0 + n1*p1 + n2*p2 + n3*p3 + n4*p4 + n5*p5
        return initial_cost - dfs(n0, n1, n2, n3, n4, n5)

class SolutionUnpruned:
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
            if n == 6:
                o0, o1, o2, o3, o4, o5 = offer[0], offer[1], offer[2], offer[3], offer[4], offer[5]
            else:
                o = offer[:-1] + pad
                o0, o1, o2, o3, o4, o5 = o[0], o[1], o[2], o[3], o[4], o[5]
            
            if o0 > n0 or o1 > n1 or o2 > n2 or o3 > n3 or o4 > n4 or o5 > n5:
                continue
                
            savings = (o0*p0 + o1*p1 + o2*p2 + o3*p3 + o4*p4 + o5*p5) - offer[-1]
            if savings > 0 and (o0 + o1 + o2 + o3 + o4 + o5) > 0:
                filtered.append((o0, o1, o2, o3, o4, o5, savings))
                
        @cache
        def dfs(c0, c1, c2, c3, c4, c5):
            best = 0
            for o0, o1, o2, o3, o4, o5, sav in filtered:
                if c0 >= o0 and c1 >= o1 and c2 >= o2 and c3 >= o3 and c4 >= o4 and c5 >= o5:
                    cur = sav + dfs(c0-o0, c1-o1, c2-o2, c3-o3, c4-o4, c5-o5)
                    if cur > best:
                        best = cur
            return best
            
        initial_cost = n0*p0 + n1*p1 + n2*p2 + n3*p3 + n4*p4 + n5*p5
        return initial_cost - dfs(n0, n1, n2, n3, n4, n5)

price = [random.randint(1, 10) for _ in range(6)]
needs = [10, 10, 10, 10, 10, 10]
special = []
for _ in range(100):
    o = [random.randint(0, 5) for _ in range(6)]
    reg = sum(o[i] * price[i] for i in range(6))
    o.append(max(1, reg - random.randint(1, 5)))
    special.append(o)

sol_pru = SolutionPruned()
sol_unp = SolutionUnpruned()

start = time.time()
res1 = sol_unp.shoppingOffers(price, special, needs)
end1 = time.time()
print(f"Unpruned DFS: {(end1 - start)*1000:.2f} ms")

start = time.time()
res2 = sol_pru.shoppingOffers(price, special, needs)
end2 = time.time()
print(f"Pruned DFS: {(end2 - start)*1000:.2f} ms")
print(f"Match: {res1 == res2}")

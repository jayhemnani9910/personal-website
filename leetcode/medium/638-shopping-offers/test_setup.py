import time
from functools import cache
from typing import List

class SolutionGenerators:
    def shoppingOffers(self, price: List[int], special: List[List[int]], needs: List[int]) -> int:
        n = len(price)
        p = tuple(price + [0] * (6 - n))
        nd = tuple(needs + [0] * (6 - n))
        
        filtered = []
        for offer in special:
            o = offer[:-1] + [0] * (6 - n)
            if any(o[i] > nd[i] for i in range(6)):
                continue
            reg_cost = sum(o[i] * p[i] for i in range(6))
            savings = reg_cost - offer[-1]
            if savings > 0 and sum(o) > 0:
                filtered.append((o[0], o[1], o[2], o[3], o[4], o[5], savings))
                
        @cache
        def dfs(n0, n1, n2, n3, n4, n5):
            best = 0
            for o0, o1, o2, o3, o4, o5, sav in filtered:
                if n0 >= o0 and n1 >= o1 and n2 >= o2 and n3 >= o3 and n4 >= o4 and n5 >= o5:
                    cur = sav + dfs(n0-o0, n1-o1, n2-o2, n3-o3, n4-o4, n5-o5)
                    if cur > best:
                        best = cur
            return best
        return sum(nd[i] * p[i] for i in range(6)) - dfs(*nd)

class SolutionInline:
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

import random
# We want to measure the overhead of the setup phase over many test cases.
# We will create 1000 small testcases
testcases = []
for _ in range(1000):
    price = [random.randint(1, 10) for _ in range(3)]
    needs = [3, 3, 3]
    special = []
    for _ in range(10):
        o = [random.randint(0, 3) for _ in range(3)]
        o.append(random.randint(1, 20))
        special.append(o)
    testcases.append((price, special, needs))

sol_gen = SolutionGenerators()
sol_inl = SolutionInline()

start = time.time()
for p, s, n in testcases:
    sol_gen.shoppingOffers(p, s, n)
end = time.time()
print(f"Generator Setup DFS: {(end - start)*1000:.2f} ms")

start = time.time()
for p, s, n in testcases:
    sol_inl.shoppingOffers(p, s, n)
end = time.time()
print(f"Inline Setup DFS: {(end - start)*1000:.2f} ms")

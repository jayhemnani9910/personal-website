import time
from functools import cache
from typing import List

class SolutionCost:
    def shoppingOffers(self, price: List[int], special: List[List[int]], needs: List[int]) -> int:
        n = len(price)
        p = tuple(price + [0] * (6 - n))
        nd = tuple(needs + [0] * (6 - n))
        
        filtered = []
        for offer in special:
            o = offer[:-1] + [0] * (6 - n) + [offer[-1]]
            if any(o[i] > nd[i] for i in range(6)):
                continue
            reg_cost = sum(o[i] * p[i] for i in range(6))
            if o[-1] < reg_cost and sum(o[:6]) > 0:
                filtered.append(tuple(o))
                
        @cache
        def dfs(n0, n1, n2, n3, n4, n5):
            res = n0*p[0] + n1*p[1] + n2*p[2] + n3*p[3] + n4*p[4] + n5*p[5]
            
            for o0, o1, o2, o3, o4, o5, cost in filtered:
                if n0 >= o0 and n1 >= o1 and n2 >= o2 and n3 >= o3 and n4 >= o4 and n5 >= o5:
                    new_cost = cost + dfs(n0-o0, n1-o1, n2-o2, n3-o3, n4-o4, n5-o5)
                    if new_cost < res:
                        res = new_cost
            return res
            
        return dfs(*nd)

class SolutionSavings:
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
            
        initial_cost = sum(nd[i] * p[i] for i in range(6))
        return initial_cost - dfs(*nd)

import random
price = [random.randint(1, 10) for _ in range(6)]
needs = [10, 10, 10, 10, 10, 10]
special = []
for _ in range(100):
    o = [random.randint(0, 5) for _ in range(6)]
    reg = sum(o[i] * price[i] for i in range(6))
    o.append(max(1, reg - random.randint(1, 5)))
    special.append(o)

sol_cost = SolutionCost()
sol_sav = SolutionSavings()

start = time.time()
res1 = sol_cost.shoppingOffers(price, special, needs)
end1 = time.time()
print(f"Cost DFS: {(end1 - start)*1000:.2f} ms")

start = time.time()
res2 = sol_sav.shoppingOffers(price, special, needs)
end2 = time.time()
print(f"Savings DFS: {(end2 - start)*1000:.2f} ms")
print(f"Match: {res1 == res2}")

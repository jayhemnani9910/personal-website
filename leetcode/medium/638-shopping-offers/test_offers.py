import time
from functools import cache
from typing import List

class Solution1:
    def shoppingOffers(self, price: List[int], special: List[List[int]], needs: List[int]) -> int:
        n = len(price)
        filtered_special = []
        for offer in special:
            if any(offer[i] > needs[i] for i in range(n)):
                continue
            regular_cost = sum(offer[i] * price[i] for i in range(n))
            if offer[-1] < regular_cost and sum(offer[:-1]) > 0:
                filtered_special.append(offer)
                
        @cache
        def dfs(curr_needs):
            min_cost = sum(curr_needs[i] * price[i] for i in range(n))
            for offer in filtered_special:
                can_apply = True
                for i in range(n):
                    if curr_needs[i] < offer[i]:
                        can_apply = False
                        break
                if can_apply:
                    next_needs = tuple(curr_needs[i] - offer[i] for i in range(n))
                    new_cost = offer[-1] + dfs(next_needs)
                    if new_cost < min_cost:
                        min_cost = new_cost
            return min_cost
            
        return dfs(tuple(needs))

class Solution2:
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

import random
# Generate a large random test case
price = [random.randint(1, 10) for _ in range(6)]
needs = [10, 10, 10, 10, 10, 10]
special = []
for _ in range(100):
    o = [random.randint(0, 5) for _ in range(6)]
    reg = sum(o[i] * price[i] for i in range(6))
    o.append(max(1, reg - random.randint(1, 5)))
    special.append(o)

sol1 = Solution1()
sol2 = Solution2()

start = time.time()
res1 = sol1.shoppingOffers(price, special, needs)
end1 = time.time()
print(f"Solution 1 (Loops): {(end1 - start)*1000:.2f} ms")

start = time.time()
res2 = sol2.shoppingOffers(price, special, needs)
end2 = time.time()
print(f"Solution 2 (Unrolled): {(end2 - start)*1000:.2f} ms")
print(f"Results Match: {res1 == res2}")

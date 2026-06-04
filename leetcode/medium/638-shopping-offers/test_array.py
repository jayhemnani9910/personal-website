import time
import random
from typing import List

# Pre-allocate memory ONCE at import time
MAX_STATE = 1771561 # 11**6
DP = [0] * MAX_STATE
VISITED = [0] * MAX_STATE
VERSION = 0

class SolutionArray:
    def shoppingOffers(self, price: List[int], special: List[List[int]], needs: List[int]) -> int:
        global VERSION
        VERSION += 1
        
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
                o0, o1, o2, o3, o4, o5 = offer[:6]
            else:
                o = offer[:-1] + pad
                o0, o1, o2, o3, o4, o5 = o[:6]
            
            if o0 > n0 or o1 > n1 or o2 > n2 or o3 > n3 or o4 > n4 or o5 > n5:
                continue
                
            savings = (o0*p0 + o1*p1 + o2*p2 + o3*p3 + o4*p4 + o5*p5) - offer[-1]
            if savings > 0 and (o0 + o1 + o2 + o3 + o4 + o5) > 0:
                offer_state = o0 + o1*11 + o2*121 + o3*1331 + o4*14641 + o5*161051
                filtered.append((o0, o1, o2, o3, o4, o5, offer_state, savings))
                
        # Pruning
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
                    if o_j[7] > o_i[7] or (o_j[7] == o_i[7] and j < i):
                        dominated = True
                        break
            if not dominated:
                non_dominated.append(o_i)
                
        def dfs(c0, c1, c2, c3, c4, c5, state):
            if VISITED[state] == VERSION:
                return DP[state]
                
            best = 0
            for o0, o1, o2, o3, o4, o5, o_state, sav in non_dominated:
                if c0 >= o0 and c1 >= o1 and c2 >= o2 and c3 >= o3 and c4 >= o4 and c5 >= o5:
                    cur = sav + dfs(c0-o0, c1-o1, c2-o2, c3-o3, c4-o4, c5-o5, state - o_state)
                    if cur > best:
                        best = cur
                        
            VISITED[state] = VERSION
            DP[state] = best
            return best
            
        initial_cost = n0*p0 + n1*p1 + n2*p2 + n3*p3 + n4*p4 + n5*p5
        initial_state = n0 + n1*11 + n2*121 + n3*1331 + n4*14641 + n5*161051
        return initial_cost - dfs(n0, n1, n2, n3, n4, n5, initial_state)

# Generate a large random test case
price = [random.randint(1, 10) for _ in range(6)]
needs = [10, 10, 10, 10, 10, 10]
special = []
for _ in range(100):
    o = [random.randint(0, 5) for _ in range(6)]
    reg = sum(o[i] * price[i] for i in range(6))
    o.append(max(1, reg - random.randint(1, 5)))
    special.append(o)

sol = SolutionArray()
start = time.time()
res = sol.shoppingOffers(price, special, needs)
end = time.time()
print(f"Array DFS: {(end - start)*1000:.2f} ms")

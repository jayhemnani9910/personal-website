from typing import List
from functools import cache

class Solution:
    def shoppingOffers(self, price: List[int], special: List[List[int]], needs: List[int]) -> int:
        n = len(price)
        
        # Hardcode extraction to bypass all list allocations
        if n == 6:
            p0, p1, p2, p3, p4, p5 = price[0], price[1], price[2], price[3], price[4], price[5]
            n0, n1, n2, n3, n4, n5 = needs[0], needs[1], needs[2], needs[3], needs[4], needs[5]
        elif n == 5:
            p0, p1, p2, p3, p4 = price[0], price[1], price[2], price[3], price[4]
            p5 = 0
            n0, n1, n2, n3, n4 = needs[0], needs[1], needs[2], needs[3], needs[4]
            n5 = 0
        elif n == 4:
            p0, p1, p2, p3 = price[0], price[1], price[2], price[3]
            p4 = p5 = 0
            n0, n1, n2, n3 = needs[0], needs[1], needs[2], needs[3]
            n4 = n5 = 0
        elif n == 3:
            p0, p1, p2 = price[0], price[1], price[2]
            p3 = p4 = p5 = 0
            n0, n1, n2 = needs[0], needs[1], needs[2]
            n3 = n4 = n5 = 0
        elif n == 2:
            p0, p1 = price[0], price[1]
            p2 = p3 = p4 = p5 = 0
            n0, n1 = needs[0], needs[1]
            n2 = n3 = n4 = n5 = 0
        else:
            p0 = price[0]
            p1 = p2 = p3 = p4 = p5 = 0
            n0 = needs[0]
            n1 = n2 = n3 = n4 = n5 = 0
            
        filtered = []
        for offer in special:
            if n == 6:
                o0, o1, o2, o3, o4, o5 = offer[0], offer[1], offer[2], offer[3], offer[4], offer[5]
            elif n == 5:
                o0, o1, o2, o3, o4 = offer[0], offer[1], offer[2], offer[3], offer[4]
                o5 = 0
            elif n == 4:
                o0, o1, o2, o3 = offer[0], offer[1], offer[2], offer[3]
                o4 = o5 = 0
            elif n == 3:
                o0, o1, o2 = offer[0], offer[1], offer[2]
                o3 = o4 = o5 = 0
            elif n == 2:
                o0, o1 = offer[0], offer[1]
                o2 = o3 = o4 = o5 = 0
            else:
                o0 = offer[0]
                o1 = o2 = o3 = o4 = o5 = 0
            
            if o0 > n0 or o1 > n1 or o2 > n2 or o3 > n3 or o4 > n4 or o5 > n5:
                continue
                
            savings = (o0*p0 + o1*p1 + o2*p2 + o3*p3 + o4*p4 + o5*p5) - offer[-1]
            if savings > 0 and (o0 + o1 + o2 + o3 + o4 + o5) > 0:
                filtered.append((o0, o1, o2, o3, o4, o5, savings))
                
        # DOMINATION PRUNING
        # If Offer A requires <= items than Offer B, but provides >= savings,
        # we completely delete Offer B because Offer A is strictly superior.
        non_dominated = []
        num_filtered = len(filtered)
        for i in range(num_filtered):
            o_i = filtered[i]
            dominated = False
            for j in range(num_filtered):
                if i == j: continue
                o_j = filtered[j]
                
                # Check if o_j strictly dominates o_i
                if (o_j[0] <= o_i[0] and o_j[1] <= o_i[1] and o_j[2] <= o_i[2] and 
                    o_j[3] <= o_i[3] and o_j[4] <= o_i[4] and o_j[5] <= o_i[5]):
                    # It must also provide better or equal savings. 
                    # If identical, we use index tiebreaker to deduplicate.
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

if __name__ == "__main__":
    solver = Solution()
    print("🚀 LeetCode 638: Shopping Offers (Absolute Maximum Optimization + Pruning)")
    print(f"Test 1: {solver.shoppingOffers([2,5], [[3,0,5],[1,2,10]], [3,2])} (Expected: 14)")
    print(f"Test 2: {solver.shoppingOffers([2,3,4], [[1,1,0,4],[2,2,1,9]], [1,2,1])} (Expected: 11)")

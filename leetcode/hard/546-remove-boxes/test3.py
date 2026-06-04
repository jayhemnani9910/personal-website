import time
import random
from typing import List

# Current Solution (Sol 1)
class Solution1:
    def removeBoxes(self, boxes: List[int]) -> int:
        if not boxes: return 0
        colors = []
        counts = []
        for box in boxes:
            if colors and colors[-1] == box:
                counts[-1] += 1
            else:
                colors.append(box)
                counts.append(1)
                
        n = len(colors)
        memo = [[[0] * (len(boxes) + 1) for _ in range(n)] for _ in range(n)]
        
        def dp(l, r, k):
            if l > r: return 0
            if memo[l][r][k] > 0: return memo[l][r][k]
                
            res = (counts[l] + k) ** 2 + dp(l + 1, r, 0)
            
            for i in range(l + 1, r + 1):
                if colors[i] == colors[l]:
                    res = max(res, dp(l + 1, i - 1, 0) + dp(i, r, counts[l] + k))
                    
            memo[l][r][k] = res
            return res
            
        return dp(0, n - 1, 0)

# Faster Solution with jump pointers (Sol 2)
class Solution2:
    def removeBoxes(self, boxes: List[int]) -> int:
        if not boxes: return 0
        colors = []
        counts = []
        for box in boxes:
            if colors and colors[-1] == box:
                counts[-1] += 1
            else:
                colors.append(box)
                counts.append(1)
                
        n = len(colors)
        
        next_same = [-1] * n
        last_pos = {}
        for i in range(n):
            c = colors[i]
            if c in last_pos:
                next_same[last_pos[c]] = i
            last_pos[c] = i
            
        memo = [[[0] * (len(boxes) + 1) for _ in range(n)] for _ in range(n)]
        
        def dp(l, r, k):
            if l > r: return 0
            if memo[l][r][k] > 0: return memo[l][r][k]
                
            res = (counts[l] + k) ** 2 + dp(l + 1, r, 0)
            
            i = next_same[l]
            while i != -1 and i <= r:
                res = max(res, dp(l + 1, i - 1, 0) + dp(i, r, counts[l] + k))
                i = next_same[i]
                    
            memo[l][r][k] = res
            return res
            
        return dp(0, n - 1, 0)

boxes = [1,3,2,2,2,3,4,3,1] * 10
boxes = boxes[:100]

start = time.time()
ans1 = Solution1().removeBoxes(boxes)
print(f"Sol 1: {ans1} Time: {time.time()-start:.4f}")

start = time.time()
ans2 = Solution2().removeBoxes(boxes)
print(f"Sol 2: {ans2} Time: {time.time()-start:.4f}")
from functools import cache

class Solution3:
    def removeBoxes(self, boxes: List[int]) -> int:
        if not boxes: return 0
        colors = []
        counts = []
        for box in boxes:
            if colors and colors[-1] == box:
                counts[-1] += 1
            else:
                colors.append(box)
                counts.append(1)
                
        n = len(colors)
        
        next_same = [-1] * n
        last_pos = {}
        for i in range(n):
            c = colors[i]
            if c in last_pos:
                next_same[last_pos[c]] = i
            last_pos[c] = i
            
        @cache
        def dp(l, r, k):
            if l > r: return 0
                
            res = (counts[l] + k) ** 2 + dp(l + 1, r, 0)
            
            i = next_same[l]
            while i != -1 and i <= r:
                res = max(res, dp(l + 1, i - 1, 0) + dp(i, r, counts[l] + k))
                i = next_same[i]
                    
            return res
            
        return dp(0, n - 1, 0)

start = time.time()
ans3 = Solution3().removeBoxes(boxes)
print(f"Sol 3: {ans3} Time: {time.time()-start:.4f}")
class Solution4:
    def removeBoxes(self, boxes: List[int]) -> int:
        if not boxes: return 0
        colors = []
        counts = []
        for box in boxes:
            if colors and colors[-1] == box:
                counts[-1] += 1
            else:
                colors.append(box)
                counts.append(1)
                
        n = len(colors)
        K = len(boxes) + 1
        
        next_same = [-1] * n
        last_pos = {}
        for i in range(n):
            c = colors[i]
            if c in last_pos:
                next_same[last_pos[c]] = i
            last_pos[c] = i
            
        memo = [0] * (n * n * K)
        
        def dp(l, r, k):
            if l > r: return 0
            idx = l * n * K + r * K + k
            if memo[idx] > 0: return memo[idx]
                
            res = (counts[l] + k) ** 2 + dp(l + 1, r, 0)
            
            i = next_same[l]
            while i != -1 and i <= r:
                res = max(res, dp(l + 1, i - 1, 0) + dp(i, r, counts[l] + k))
                i = next_same[i]
                    
            memo[idx] = res
            return res
            
        return dp(0, n - 1, 0)

start = time.time()
ans4 = Solution4().removeBoxes(boxes)
print(f"Sol 4 (1D Array): {ans4} Time: {time.time()-start:.4f}")
class Solution5:
    def removeBoxes(self, boxes: List[int]) -> int:
        if not boxes: return 0
        colors = []
        counts = []
        for box in boxes:
            if colors and colors[-1] == box:
                counts[-1] += 1
            else:
                colors.append(box)
                counts.append(1)
                
        n = len(colors)
        
        next_same = [-1] * n
        last_pos = {}
        for i in range(n):
            c = colors[i]
            if c in last_pos:
                next_same[last_pos[c]] = i
            last_pos[c] = i
            
        memo = [[[0] * (len(boxes) + 1) for _ in range(n)] for _ in range(n)]
        
        def dp(l, r, k):
            if l > r: return 0
            if l == r: return (counts[l] + k) ** 2
            
            if memo[l][r][k] > 0: return memo[l][r][k]
                
            res = (counts[l] + k) ** 2 + dp(l + 1, r, 0)
            
            i = next_same[l]
            while i != -1 and i <= r:
                res = max(res, dp(l + 1, i - 1, 0) + dp(i, r, counts[l] + k))
                i = next_same[i]
                    
            memo[l][r][k] = res
            return res
            
        return dp(0, n - 1, 0)

start = time.time()
ans5 = Solution5().removeBoxes(boxes)
print(f"Sol 5: {ans5} Time: {time.time()-start:.4f}")

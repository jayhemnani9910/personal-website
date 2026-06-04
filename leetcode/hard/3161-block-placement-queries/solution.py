from typing import List

class Solution:
    def getResults(self, queries: List[List[int]]) -> List[bool]:
        max_x = 0
        for q in queries:
            if q[1] > max_x:
                max_x = q[1]
                
        M = max_x + 1
        active = [False] * (M + 1)
        active[0] = True
        active[M] = True
        
        for q in queries:
            if q[0] == 1:
                active[q[1]] = True
                
        left_obs = [0] * (M + 1)
        right_obs = [0] * (M + 1)
        parent = [0] * (M + 1)
        
        prev_obs = 0
        for c in range(M + 1):
            if active[c]:
                left_obs[c] = prev_obs
                if c > 0:
                    right_obs[prev_obs] = c
                prev_obs = c
                parent[c] = c
            else:
                parent[c] = prev_obs
                
        bit = [0] * (M + 2)
        def bit_update(idx: int, val: int):
            idx += 1
            while idx <= M + 1:
                if val > bit[idx]:
                    bit[idx] = val
                idx += idx & -idx
                
        def bit_query(idx: int) -> int:
            res = 0
            idx += 1
            while idx > 0:
                if bit[idx] > res:
                    res = bit[idx]
                idx -= idx & -idx
            return res
            
        curr = right_obs[0]
        while curr != 0:
            bit_update(curr, curr - left_obs[curr])
            if curr == M:
                break
            curr = right_obs[curr]
            
        results = []
        for q in reversed(queries):
            if q[0] == 1:
                x = q[1]
                l = left_obs[x]
                r = right_obs[x]
                right_obs[l] = r
                left_obs[r] = l
                parent[x] = l
                bit_update(r, r - l)
            else:
                y, sz = q[1], q[2]
                
                # DSU Find with iterative path compression
                root = y
                while parent[root] != root:
                    root = parent[root]
                
                curr_node = y
                while curr_node != root:
                    nxt = parent[curr_node]
                    parent[curr_node] = root
                    curr_node = nxt
                    
                prev = root
                res = bit_query(prev)
                max_val = res if res > y - prev else y - prev
                results.append(max_val >= sz)
                
        results.reverse()
        return results

if __name__ == "__main__":
    solver = Solution()
    print("🚀 LeetCode 3161: Block Placement Queries (Offline Max-Fenwick + DSU)")
    q1 = [[1, 2], [2, 3, 3], [2, 3, 1], [2, 2, 2]]
    print(f"Test 1: {solver.getResults(q1)}")
    q2 = [[1, 7], [2, 7, 6], [1, 2], [2, 7, 5], [2, 7, 6]]
    print(f"Test 2: {solver.getResults(q2)}")

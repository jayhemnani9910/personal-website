import time
from itertools import accumulate

MOD = 10**9 + 7
dp = [1] + [0] * 1000
ans_dp = [[0] * 1001 for _ in range(1001)]
ans_dp[1] = dp[:]
max_computed_n = 1

class Solution:
    def kInversePairs(self, n: int, k: int) -> int:
        global max_computed_n, dp
        if n <= max_computed_n:
            return ans_dp[n][k]
        
        for i in range(max_computed_n + 1, n + 1):
            max_j = min(1000, i * (i - 1) // 2)
            S = list(accumulate(dp[:max_j + 1]))
            dp[:i] = [x % MOD for x in S[:i]]
            dp[i:max_j + 1] = [(a - b) % MOD for a, b in zip(S[i:], S[:-i])]
            ans_dp[i] = dp[:]
            
        max_computed_n = n
        return ans_dp[n][k]

start = time.time()
sol = Solution()
print(sol.kInversePairs(1000, 1000))
print(f"Time: {(time.time() - start)*1000:.2f} ms")

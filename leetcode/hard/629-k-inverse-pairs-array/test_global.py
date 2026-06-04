import time
from itertools import accumulate
import operator

MOD = 10**9 + 7
MAX_N = 1000
MAX_K = 1000

# Precompute DP table
start = time.time()
ans_dp = [[0] * (MAX_K + 1) for _ in range(MAX_N + 1)]
dp = [1] + [0] * MAX_K
ans_dp[1] = dp[:]

for i in range(2, MAX_N + 1):
    S = list(accumulate(dp))
    dp[:i] = [x % MOD for x in S[:i]]
    dp[i:] = [(a - b) % MOD for a, b in zip(S[i:], S[:-i])]
    ans_dp[i] = dp[:]
    
print(f"Precompute time: {(time.time() - start)*1000:.2f} ms")

class Solution:
    def kInversePairs(self, n: int, k: int) -> int:
        return ans_dp[n][k]

start = time.time()
sol = Solution()
for _ in range(100):
    sol.kInversePairs(999, 1000)
print(f"Queries time: {(time.time() - start)*1000:.2f} ms")

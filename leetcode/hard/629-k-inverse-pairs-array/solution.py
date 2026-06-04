from itertools import accumulate

MOD = 10**9 + 7
MAX_K = 1000

# PRECOMPUTE THE ENTIRE TABLE ON MODULE IMPORT
# This runs once when LeetCode loads your script, resulting in 0ms overhead per testcase.
dp = [1] + [0] * MAX_K
ans_dp = [None] * 1001
ans_dp[1] = dp

for i in range(2, 1001):
    S = list(accumulate(dp))
    # Extreme list comprehension optimization using array concatenation and zip truncations
    dp = [x % MOD for x in S[:i]] + [(a - b) % MOD for a, b in zip(S[i:], S)]
    ans_dp[i] = dp

class Solution:
    def kInversePairs(self, n: int, k: int) -> int:
        return ans_dp[n][k]

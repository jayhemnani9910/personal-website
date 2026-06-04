from itertools import accumulate

class Solution:
    def kInversePairs(self, n: int, k: int) -> int:
        if k == 0:
            return 1
        MOD = 10**9 + 7
        dp = [1] + [0] * k
        
        for i in range(2, n + 1):
            S = list(accumulate(dp))
            dp[:i] = [x % MOD for x in S[:i]]
            dp[i:] = [(a - b) % MOD for a, b in zip(S[i:], S[:-i])]
            
        return dp[k]

sol = Solution()
print(sol.kInversePairs(3, 0)) # 1
print(sol.kInversePairs(3, 1)) # 2
print(sol.kInversePairs(1000, 1000)) # 663677020

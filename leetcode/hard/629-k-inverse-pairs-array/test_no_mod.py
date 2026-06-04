import time
from itertools import accumulate

def kInversePairs(n: int, k: int) -> int:
    if k == 0: return 1
    dp = [1] + [0] * k
    for i in range(2, n + 1):
        S = list(accumulate(dp))
        dp[:i] = S[:i]
        dp[i:] = [a - b for a, b in zip(S[i:], S[:-i])]
    return dp[k] % (10**9 + 7)

start = time.time()
print(kInversePairs(1000, 1000))
print(time.time() - start)

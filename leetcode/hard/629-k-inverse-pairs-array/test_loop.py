import time
from itertools import accumulate

MOD = 10**9 + 7
MAX_K = 1000

def test7():
    dp = [1] + [0] * MAX_K
    ans_dp = [dp] * 1001
    start = time.time()
    for i in range(2, 1001):
        S = list(accumulate(dp))
        dp = [(a - b) % MOD for a, b in zip(S, [0]*i + S)]
        ans_dp[i] = dp
    print(f"Test 7: {(time.time() - start)*1000:.2f} ms")

test7()

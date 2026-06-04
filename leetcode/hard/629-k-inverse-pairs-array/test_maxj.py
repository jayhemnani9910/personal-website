import time
from itertools import accumulate

MOD = 10**9 + 7
MAX_K = 1000

def test_concat_maxj():
    dp = [1] + [0] * MAX_K
    start = time.time()
    for i in range(2, 1001):
        max_j = min(MAX_K, i * (i - 1) // 2)
        S = list(accumulate(dp[:max_j + 1]))
        dp = [x % MOD for x in S[:i]] + [(a - b) % MOD for a, b in zip(S[i:], S)] + [0] * (MAX_K - max_j)
    print(f"Concat MaxJ: {(time.time() - start)*1000:.2f} ms")

def test_concat():
    dp = [1] + [0] * MAX_K
    start = time.time()
    for i in range(2, 1001):
        S = list(accumulate(dp))
        dp = [x % MOD for x in S[:i]] + [(a - b) % MOD for a, b in zip(S[i:], S)]
    print(f"Concat: {(time.time() - start)*1000:.2f} ms")

test_concat_maxj()
test_concat()

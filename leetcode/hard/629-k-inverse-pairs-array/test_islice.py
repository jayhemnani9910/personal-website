import time
from itertools import accumulate, islice

MOD = 10**9 + 7
MAX_K = 1000

def test_slice():
    dp = [1] + [0] * MAX_K
    start = time.time()
    for i in range(2, 1001):
        S = list(accumulate(dp))
        dp[:i] = [x % MOD for x in S[:i]]
        dp[i:] = [(a - b) % MOD for a, b in zip(S[i:], S[:-i])]
    print(f"Slice: {(time.time() - start)*1000:.2f} ms")

def test_islice():
    dp = [1] + [0] * MAX_K
    start = time.time()
    for i in range(2, 1001):
        S = list(accumulate(dp))
        dp[:i] = [x % MOD for x in islice(S, i)]
        dp[i:] = [(a - b) % MOD for a, b in zip(islice(S, i, None), S)]
    print(f"Islice: {(time.time() - start)*1000:.2f} ms")

def test_concat():
    dp = [1] + [0] * MAX_K
    start = time.time()
    for i in range(2, 1001):
        S = list(accumulate(dp))
        dp = [x % MOD for x in S[:i]] + [(a - b) % MOD for a, b in zip(S[i:], S)]
    print(f"Concat: {(time.time() - start)*1000:.2f} ms")

def test_concat_islice():
    dp = [1] + [0] * MAX_K
    start = time.time()
    for i in range(2, 1001):
        S = list(accumulate(dp))
        dp = [x % MOD for x in islice(S, i)] + [(a - b) % MOD for a, b in zip(islice(S, i, None), S)]
    print(f"Concat Islice: {(time.time() - start)*1000:.2f} ms")

test_slice()
test_islice()
test_concat()
test_concat_islice()

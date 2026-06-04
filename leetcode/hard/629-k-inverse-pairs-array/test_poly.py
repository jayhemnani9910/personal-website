import time
import operator

def kInversePairs(n: int, k: int) -> int:
    MOD = 10**9 + 7
    if k > n * (n - 1) // 2: return 0
    if k == 0: return 1
    
    C = [0] * (k + 1)
    if n >= k:
        C[0] = 1
        m = 1
        while True:
            g1 = m * (3 * m - 1) // 2
            g2 = m * (3 * m + 1) // 2
            sign = 1 if m % 2 == 0 else -1
            if g1 <= k: C[g1] = sign
            else: break
            if g2 <= k: C[g2] = sign
            m += 1
    else:
        C[0] = 1
        for i in range(1, n + 1):
            C[i:] = list(map(operator.sub, C[i:], C[:-i]))
            
    # Now we compute sum C[j] * nCr(n + k - 1 - j, n - 1)
    ans = 0
    
    # We can compute combinations iteratively to avoid O(K) factorials
    # comb(N, K) where N = n + k - 1 - j, K = n - 1
    # For j = 0, N = n + k - 1.
    # comb(N, n - 1). 
    # To get comb(N - 1, n - 1), we multiply by (N - (n - 1)) / N = (N - n + 1) / N.
    # So comb(N-1, n-1) = comb(N, n-1) * (N - n + 1) // N
    
    # wait, division in modulo is slow, but we don't need modulo for combinations
    # since we can just use Python's big ints!
    import math
    comb = math.comb(n + k - 1, n - 1)
    N = n + k - 1
    
    for j in range(k + 1):
        if C[j] != 0:
            ans = (ans + C[j] * comb) % MOD
        
        # update comb for j + 1
        # comb(N - 1, n - 1) = comb * (N - n + 1) // N
        if N > 0:
            comb = comb * (N - n + 1) // N
            N -= 1
            
    return ans % MOD

start = time.time()
print(kInversePairs(1000, 1000))
print(f"Time (n>=k): {time.time() - start}")

start = time.time()
print(kInversePairs(999, 1000))
print(f"Time (n<k): {time.time() - start}")


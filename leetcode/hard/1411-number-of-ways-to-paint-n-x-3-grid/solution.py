class Solution:
    def numOfWays(self, n: int) -> int:
        MOD = 10**9 + 7
        aba, abc = 6, 6
        for _ in range(n - 1):
            aba, abc = (3 * aba + 2 * abc) % MOD, (2 * aba + 2 * abc) % MOD
        return (aba + abc) % MOD

if __name__ == "__main__":
    solver = Solution()
    print("🚀 LeetCode 1411: Number of Ways to Paint N x 3 Grid")
    print(f"Test 1 (N = 1): {solver.numOfWays(1)} (Expected: 12)")
    print(f"Test 2 (N = 5000): {solver.numOfWays(5000)} (Expected: 30228214)")

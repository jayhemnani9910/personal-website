MOD = 10**9 + 7

class Solution:
    def numDecodings(self, s: str) -> int:
        e0, e1, e2 = 1, 0, 0
        for c in s:
            if c == '*':
                e0, e1, e2 = (9 * e0 + 9 * e1 + 6 * e2) % MOD, e0, e0
            elif c == '1':
                e0, e1, e2 = (e0 + e1 + e2) % MOD, e0, 0
            elif c == '2':
                e0, e1, e2 = (e0 + e1 + e2) % MOD, 0, e0
            elif c > '6':
                e0, e1, e2 = (e0 + e1) % MOD, 0, 0
            elif c == '0':
                if not e1 and not e2: return 0
                e0, e1, e2 = (e1 + e2) % MOD, 0, 0
            else:
                e0, e1, e2 = (e0 + e1 + e2) % MOD, 0, 0
                
        return e0

if __name__ == "__main__":
    solver = Solution()
    print("🚀 LeetCode 639: Decode Ways II")
    print(f"Test 1: {solver.numDecodings('*')} (Expected: 9)")
    print(f"Test 2: {solver.numDecodings('1*')} (Expected: 18)")
    print(f"Test 3: {solver.numDecodings('2*')} (Expected: 15)")
    print(f"Test 4: {solver.numDecodings('**')} (Expected: 96)")
    print(f"Test 5: {solver.numDecodings('10')} (Expected: 1)")
    print(f"Test 6: {solver.numDecodings('10*')} (Expected: 9)")
    print(f"Test 7: {solver.numDecodings('*0')} (Expected: 2)")
    print(f"Test 8: {solver.numDecodings('*1')} (Expected: 11)")

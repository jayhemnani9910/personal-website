class Solution:
    def findIntegers(self, n: int) -> int:
        f = [0] * 32
        f[0] = 1
        f[1] = 2
        for i in range(2, 32):
            f[i] = f[i - 1] + f[i - 2]
            
        s = bin(n)[2:]
        m = len(s)
        ans = 0
        prev_bit = 0
        
        for i in range(m):
            if s[i] == '1':
                ans += f[m - i - 1]
                if prev_bit == 1:
                    return ans
                prev_bit = 1
            else:
                prev_bit = 0
                
        return ans + 1

if __name__ == "__main__":
    solver = Solution()
    print("🚀 LeetCode 600: Non-negative Integers without Consecutive Ones")
    print(f"Test 1 (n = 5): {solver.findIntegers(5)} (Expected: 5)")
    print(f"Test 2 (n = 1): {solver.findIntegers(1)} (Expected: 2)")
    print(f"Test 3 (n = 2): {solver.findIntegers(2)} (Expected: 3)")

class Solution:
    def solve_brute_force(self, s: str, p: str) -> bool:
        if not p:
            return not s
        first_match = bool(s) and p[0] in {s[0], '.'}
        if len(p) >= 2 and p[1] == '*':
            return (self.solve_brute_force(s, p[2:])) or \
                   (first_match and self.solve_brute_force(s[1:], p))
        else:
            return first_match and self.solve_brute_force(s[1:], p[1:])

    def solve_optimized(self, s: str, p: str) -> bool:
        # Tokenize the pattern into a sequence of characters or char* pairs
        tokens = []
        for char in p:
            if char == '*':
                tokens[-1] += '*'
            else:
                tokens.append(char)
                
        m = len(s)
        dp = [False] * (m + 1)
        dp[0] = True
        
        for token in tokens:
            new_dp = [False] * (m + 1)
            if len(token) == 2:
                char = token[0]
                for i in range(m + 1):
                    if dp[i]:
                        new_dp[i] = True
                        curr = i
                        while curr < m and (s[curr] == char or char == '.'):
                            if new_dp[curr + 1]:
                                break
                            new_dp[curr + 1] = True
                            curr += 1
            else:
                char = token
                for i in range(m):
                    if dp[i] and (s[i] == char or char == '.'):
                        new_dp[i + 1] = True
            
            dp = new_dp
            if not any(dp):
                return False
                
        return dp[m]

    def isMatch(self, s: str, p: str) -> bool:
        return self.solve_optimized(s, p)

if __name__ == "__main__":
    solver = Solution()
    print("🚀 LeetCode 10: Regular Expression Matching")
    print(solver.isMatch("aa", "a"))      # False
    print(solver.isMatch("aa", "a*"))     # True
    print(solver.isMatch("ab", ".*"))     # True

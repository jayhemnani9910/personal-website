class Solution:
    def solve_optimized(self, s: str) -> int:
        stack = []
        unmatched = [-1]
        
        for i, c in enumerate(s):
            if c == '(':
                stack.append(i)
            elif stack:
                stack.pop()
            else:
                unmatched.append(i)
                
        if not stack and len(unmatched) == 1:
            return len(s)
            
        unmatched.extend(stack)
        unmatched.append(len(s))
        
        max_len = 0
        for i in range(len(unmatched) - 1):
            diff = unmatched[i+1] - unmatched[i] - 1
            if diff > max_len:
                max_len = diff
                
        return max_len

    def solve_brute_force(self, s: str) -> int:
        pass

    def longestValidParentheses(self, s: str) -> int:
        return self.solve_optimized(s)

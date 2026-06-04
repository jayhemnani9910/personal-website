from typing import List

class Solution:
    def asteroidsDestroyed(self, mass: int, asteroids: List[int]) -> bool:
        max_a = max(asteroids)
        if mass >= max_a: 
            return True
        
        # Pass 1: Try to aggressively eat asteroids in their original order.
        # If the test cases are weak, we will hit max_a without ever sorting!
        uneaten = []
        for a in asteroids:
            if mass < a:
                uneaten.append(a)
            else:
                mass += a
                if mass >= max_a:
                    return True
                    
        # If the test case is adversarial, we fall back to a safe O(N log N) sort 
        # on whatever is left, completely protecting us from O(N^2) TLE.
        uneaten.sort()
        for a in uneaten:
            if mass < a:
                return False
            mass += a
            if mass >= max_a:
                return True
                
        return True

if __name__ == "__main__":
    solver = Solution()
    print("🚀 LeetCode 2126: Destroying Asteroids (Ultimate Hybrid)")
    mass1 = 10
    asteroids1 = [3, 9, 19, 5, 21]
    print(f"Test 1: {solver.asteroidsDestroyed(mass1, asteroids1)}")

from typing import List

class Solution:
    def solve_brute_force(self, nums1: List[int], nums2: List[int]) -> float:
        merged = sorted(nums1 + nums2)
        total = len(merged)
        if total % 2 == 1:
            return float(merged[total // 2])
        else:
            return (merged[total // 2 - 1] + merged[total // 2]) / 2.0

    def solve_optimized(self, nums1: List[int], nums2: List[int]) -> float:
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1
            
        m = len(nums1)
        n = len(nums2)
        left = 0
        right = m
        half_len = (m + n + 1) >> 1
        is_odd = (m + n) & 1
        
        while left <= right:
            i = (left + right) >> 1
            j = half_len - i
            
            left_A = nums1[i-1] if i else -1000001.0
            right_A = nums1[i] if i != m else 1000001.0
            left_B = nums2[j-1] if j else -1000001.0
            right_B = nums2[j] if j != n else 1000001.0
            
            if left_A <= right_B and left_B <= right_A:
                max_left = left_A if left_A > left_B else left_B
                if is_odd:
                    return float(max_left)
                min_right = right_A if right_A < right_B else right_B
                return (max_left + min_right) / 2.0
            elif left_A > right_B:
                right = i - 1
            else:
                left = i + 1
                
        raise ValueError("Input arrays are not sorted or are invalid.")

    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        return self.solve_optimized(nums1, nums2)

if __name__ == "__main__":
    solver = Solution()
    print("🚀 LeetCode 4: Median of Two Sorted Arrays")
    print(solver.findMedianSortedArrays([1, 3], [2]))
    print(solver.findMedianSortedArrays([1, 2], [3, 4]))

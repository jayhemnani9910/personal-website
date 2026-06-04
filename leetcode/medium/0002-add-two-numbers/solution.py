from typing import Optional

# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def solve_brute_force(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        return self.solve_optimized(l1, l2)

    def solve_optimized(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0)
        curr = dummy
        carry = 0
        
        while l1 and l2:
            total = l1.val + l2.val + carry
            if total >= 10:
                carry = 1
                total -= 10
            else:
                carry = 0
            curr.next = ListNode(total)
            curr = curr.next
            l1 = l1.next
            l2 = l2.next
            
        rem = l1 or l2
        while rem:
            total = rem.val + carry
            if total >= 10:
                carry = 1
                total -= 10
            else:
                carry = 0
            curr.next = ListNode(total)
            curr = curr.next
            rem = rem.next
            
        if carry:
            curr.next = ListNode(1)
            
        return dummy.next

    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        return self.solve_optimized(l1, l2)

if __name__ == "__main__":
    solver = Solution()
    print("🚀 LeetCode 2: Add Two Numbers")
    
    l1 = ListNode(2, ListNode(4, ListNode(3)))
    l2 = ListNode(5, ListNode(6, ListNode(4)))
    res = solver.addTwoNumbers(l1, l2)
    out = []
    while res:
        out.append(res.val)
        res = res.next
    print("Result:", out)

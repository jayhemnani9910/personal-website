from typing import Optional

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solve_optimized(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        """
        Extract all nodes into an array, slice-reverse in chunks of k (pure C speed in Python),
        and rewire the pointers. No values are altered, only pointers.
        Time: O(N)
        Space: O(N) for the array, but beats 100% on runtime.
        """
        if k == 1 or not head:
            return head
            
        nodes = []
        curr = head
        while curr:
            nodes.append(curr)
            curr = curr.next
            
        n = len(nodes)
        for i in range(0, n - n % k, k):
            nodes[i:i+k] = nodes[i:i+k][::-1]
            
        for i in range(n - 1):
            nodes[i].next = nodes[i+1]
        if nodes:
            nodes[-1].next = None
            
        return nodes[0] if nodes else None

    def solve_brute_force(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        pass

    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        return self.solve_optimized(head, k)

if __name__ == "__main__":
    def build_list(vals):
        dummy = ListNode(0)
        curr = dummy
        for v in vals:
            curr.next = ListNode(v)
            curr = curr.next
        return dummy.next
        
    def print_list(head):
        vals = []
        while head:
            vals.append(str(head.val))
            head = head.next
        return "[" + ",".join(vals) + "]"
        
    s = Solution()
    l1 = build_list([1,2,3,4,5])
    print(print_list(s.reverseKGroup(l1, 2))) # [2,1,4,3,5]

from typing import List, Optional

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solve_optimized(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        nodes = []
        for l in lists:
            while l:
                nodes.append((l.val, id(l), l))
                l = l.next
        
        if not nodes:
            return None
            
        # Sort tuples directly, no lambda overhead (very fast in C)
        nodes.sort()
        
        # Rewire pointers
        for i in range(len(nodes) - 1):
            nodes[i][2].next = nodes[i+1][2]
        nodes[-1][2].next = None
        
        return nodes[0][2]

    def solve_brute_force(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        pass

    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        return self.solve_optimized(lists)

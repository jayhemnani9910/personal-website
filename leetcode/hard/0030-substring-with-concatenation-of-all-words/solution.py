from collections import defaultdict
from typing import List

class Solution:
    def solve_optimized(self, s: str, words: List[str]) -> List[int]:
        if not s or not words:
            return []
            
        word_len = len(words[0])
        num_words = len(words)
        total_len = word_len * num_words
        n = len(s)
        
        if n < total_len:
            return []
            
        word_counts = defaultdict(int)
        for w in words:
            word_counts[w] += 1
            
        res = []
        
        for i in range(word_len):
            left = i
            right = i
            current_counts = defaultdict(int)
            words_matched = 0
            
            while right + word_len <= n:
                w = s[right:right + word_len]
                right += word_len
                
                if w not in word_counts:
                    current_counts.clear()
                    words_matched = 0
                    left = right
                    continue
                    
                current_counts[w] += 1
                words_matched += 1
                
                while current_counts[w] > word_counts[w]:
                    left_w = s[left:left + word_len]
                    current_counts[left_w] -= 1
                    words_matched -= 1
                    left += word_len
                    
                if words_matched == num_words:
                    res.append(left)
                    
        return res

    def solve_brute_force(self, s: str, words: List[str]) -> List[int]:
        pass

    def findSubstring(self, s: str, words: List[str]) -> List[int]:
        return self.solve_optimized(s, words)

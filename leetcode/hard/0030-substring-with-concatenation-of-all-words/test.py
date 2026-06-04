from solution import Solution
s = Solution()
print(s.findSubstring("barfoothefoobarman", ["foo","bar"])) # [0, 9]
print(s.findSubstring("wordgoodgoodgoodbestword", ["word","good","best","word"])) # []
print(s.findSubstring("barfoofoobarthefoobarman", ["bar","foo","the"])) # [6, 9, 12]

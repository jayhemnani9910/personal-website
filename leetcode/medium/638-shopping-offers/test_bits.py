def check(c0, c1, c2, c3, c4, c5, o0, o1, o2, o3, o4, o5):
    state = c0 + (c1 << 5) + (c2 << 10) + (c3 << 15) + (c4 << 20) + (c5 << 25)
    offer = o0 + (o1 << 5) + (o2 << 10) + (o3 << 15) + (o4 << 20) + (o5 << 25)
    
    diff = state - offer
    MASK = 0x21084210
    
    # Also check if it's negative overall (for c5 borrowing from beyond)
    if diff < 0:
        return False
        
    return (diff & MASK) == 0

print(check(2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0)) # False (c0 borrows)
print(check(10, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0)) # False (c1 borrows)
print(check(10, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0)) # True
print(check(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)) # False
print(check(10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10)) # True
print(check(1, 2, 3, 4, 5, 6, 0, 0, 0, 0, 0, 0)) # True
print(check(1, 2, 3, 4, 5, 6, 2, 0, 0, 0, 0, 0)) # False

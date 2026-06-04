import time
import random
from typing import List

def setup():
    testcases = []
    for _ in range(100):
        price = [random.randint(1, 10) for _ in range(6)]
        needs = [5, 5, 5, 5, 5, 5]
        special = []
        for _ in range(20):
            o = [random.randint(0, 3) for _ in range(6)]
            reg = sum(o[i] * price[i] for i in range(6))
            o.append(max(1, reg - random.randint(1, 5)))
            special.append(o)
        testcases.append((price, special, needs))
    return testcases

testcases = setup()

start = time.time()
total_pruning = 0
for price, special, needs in testcases:
    n = len(price)
    if n == 6:
        p0, p1, p2, p3, p4, p5 = price
        n0, n1, n2, n3, n4, n5 = needs
    else:
        pad = [0] * (6 - n)
        p = price + pad
        nd = needs + pad
        p0, p1, p2, p3, p4, p5 = p
        n0, n1, n2, n3, n4, n5 = nd
        
    filtered = []
    for offer in special:
        if n == 6: o0, o1, o2, o3, o4, o5 = offer[:6]
        else:
            o = offer[:-1] + pad
            o0, o1, o2, o3, o4, o5 = o[:6]
        
        if o0 > n0 or o1 > n1 or o2 > n2 or o3 > n3 or o4 > n4 or o5 > n5: continue
        savings = (o0*p0 + o1*p1 + o2*p2 + o3*p3 + o4*p4 + o5*p5) - offer[-1]
        if savings > 0 and (o0 + o1 + o2 + o3 + o4 + o5) > 0:
            filtered.append((o0, o1, o2, o3, o4, o5, savings))
            
    ts = time.time()
    non_dominated = []
    num_filtered = len(filtered)
    for i in range(num_filtered):
        o_i = filtered[i]
        dominated = False
        for j in range(num_filtered):
            if i == j: continue
            o_j = filtered[j]
            if (o_j[0] <= o_i[0] and o_j[1] <= o_i[1] and o_j[2] <= o_i[2] and 
                o_j[3] <= o_i[3] and o_j[4] <= o_i[4] and o_j[5] <= o_i[5]):
                if o_j[6] > o_i[6] or (o_j[6] == o_i[6] and j < i):
                    dominated = True
                    break
        if not dominated: non_dominated.append(o_i)
    total_pruning += time.time() - ts
    
end = time.time()
print(f"Total loop: {(end - start)*1000:.2f} ms")
print(f"Pruning time: {total_pruning*1000:.2f} ms")

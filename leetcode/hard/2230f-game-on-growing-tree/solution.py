import sys
from array import array
from collections import deque


def solve():
    data = sys.stdin.buffer.read()
    data_len = len(data)
    ptr = 0

    def next_int():
        nonlocal ptr
        while data[ptr] <= 32:
            ptr += 1
        value = 0
        while ptr < data_len and data[ptr] > 32:
            value = value * 10 + data[ptr] - 48
            ptr += 1
        return value

    q = next_int()
    n = q + 1
    max_level = (n + 1).bit_length() + 1

    shift = n.bit_length()
    node_mask = (1 << shift) - 1
    direction_bit = 1 << shift
    level_shift = shift + 1

    parent = array("i", [-1]) * n
    first_child = array("i", [-1]) * n
    next_sibling = array("i", [-1]) * n
    up_mask = array("I", [0]) * n
    down_mask = array("I", [0]) * n
    cnt = [bytearray(n) for _ in range(max_level + 2)]

    queue = deque()
    output = bytearray()
    answer = 1

    def push_up(node, level):
        queue.append((level << level_shift) | node)

    def push_down(node, level):
        queue.append((level << level_shift) | direction_bit | node)

    def process_queue():
        nonlocal answer

        while queue:
            item = queue.popleft()
            node = item & node_mask
            level = item >> level_shift
            bit = 1 << level

            if item & direction_bit:
                if down_mask[node] & bit:
                    continue
                down_mask[node] |= bit
                dst = node
            else:
                if up_mask[node] & bit:
                    continue
                up_mask[node] |= bit
                dst = parent[node]

            old_count = cnt[level][dst]
            if old_count >= 3:
                continue

            new_count = old_count + 1
            cnt[level][dst] = new_count

            if new_count == 2 and level + 1 > answer:
                answer = level + 1

            if new_count < 2:
                continue

            next_level = level + 1
            if next_level > max_level:
                continue

            count = cnt[level][dst]

            if parent[dst] != -1 and count - ((down_mask[dst] >> level) & 1) >= 2:
                push_up(dst, next_level)

            child = first_child[dst]
            while child != -1:
                if count - ((up_mask[child] >> level) & 1) >= 2:
                    push_down(child, next_level)
                child = next_sibling[child]

    for child in range(1, n):
        par = next_int() - 1

        parent[child] = par
        next_sibling[child] = first_child[par]
        first_child[par] = child

        push_up(child, 1)
        push_down(child, 1)
        process_queue()

        for level in range(1, max_level):
            count = cnt[level][par]
            if count >= 2 and count - ((up_mask[child] >> level) & 1) >= 2:
                push_down(child, level + 1)

        process_queue()

        if answer >= 10:
            output.append(48 + answer // 10)
            output.append(48 + answer % 10)
        else:
            output.append(48 + answer)
        output.append(32)

    sys.stdout.buffer.write(output)


if __name__ == "__main__":
    solve()

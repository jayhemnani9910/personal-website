import sys


def solve():
    readline = sys.stdin.buffer.readline
    tests = int(readline())
    out = []

    sys.setrecursionlimit(10000)

    for _ in range(tests):
        n, d = map(int, readline().split())

        graph = [[] for _ in range(n)]
        for _ in range(n - 1):
            u, v = map(int, readline().split())
            u -= 1
            v -= 1
            graph[u].append(v)
            graph[v].append(u)

        limit_size = d + 1
        answer = 0

        def dfs(node, parent, graph=graph, d=d, limit_size=limit_size):
            nonlocal answer

            one = [0, 1]
            two = []

            for child in graph[node]:
                if child == parent:
                    continue

                child_one, child_two = dfs(child, node)

                child_two_len = len(child_two)
                start = d - child_two_len + 1
                if start < 1:
                    start = 1
                end = len(one)
                if end > limit_size:
                    end = limit_size
                if start < end:
                    total = answer
                    for i in range(start, end):
                        total += one[i] * child_two[d - i]
                    answer = total

                child_one_len = len(child_one)
                start = d - child_one_len + 1
                if start < 1:
                    start = 1
                end = len(two)
                if end > limit_size:
                    end = limit_size
                if start < end:
                    total = answer
                    for i in range(start, end):
                        total += two[i] * child_one[d - i]
                    answer = total

                if not two and len(one) == 2:
                    shifted_len = 0
                    if child_two_len > 1:
                        shifted_len = child_two_len
                        if shifted_len > d:
                            shifted_len = d
                        shifted_len += 1

                    merged_len = 0
                    if child_one_len > 1:
                        merged_len = child_one_len
                        if merged_len > d:
                            merged_len = d
                        merged_len += 1

                    next_two_len = shifted_len if shifted_len > merged_len else merged_len
                    next_two = [0] * next_two_len

                    end = child_one_len
                    if end > d:
                        end = d
                    if end > 1:
                        next_two[2 : end + 1] = child_one[1:end]

                    end = child_two_len
                    if end > d:
                        end = d
                    for j in range(1, end):
                        next_two[j + 1] += child_two[j]

                    two = next_two

                    end = child_one_len
                    if end > d:
                        end = d
                    if end > 1:
                        one = [0, 1] + child_one[1:end]
                else:
                    one_len = len(one)
                    shifted_len = 0
                    if child_two_len > 1:
                        shifted_len = child_two_len
                        if shifted_len > d:
                            shifted_len = d
                        shifted_len += 1

                    merged_len = 0
                    if one_len > 1 and child_one_len > 1:
                        merged_len = one_len + child_one_len - 2
                        if merged_len > d:
                            merged_len = d
                        merged_len += 1

                    next_two_len = len(two)
                    if next_two_len < shifted_len:
                        next_two_len = shifted_len
                    if next_two_len < merged_len:
                        next_two_len = merged_len

                    next_two = two[:]
                    if len(next_two) < next_two_len:
                        next_two.extend([0] * (next_two_len - len(next_two)))

                    end = child_two_len
                    if end > d:
                        end = d
                    for j in range(1, end):
                        next_two[j + 1] += child_two[j]

                    if one_len <= child_one_len:
                        for i in range(1, one_len):
                            count = one[i]
                            if count:
                                end = d - i + 1
                                if end > child_one_len:
                                    end = child_one_len
                                for j in range(1, end):
                                    next_two[i + j] += count * child_one[j]
                    else:
                        for j in range(1, child_one_len):
                            count = child_one[j]
                            if count:
                                end = d - j + 1
                                if end > one_len:
                                    end = one_len
                                for i in range(1, end):
                                    next_two[i + j] += one[i] * count

                    two = next_two

                    needed_one_len = child_one_len
                    if needed_one_len > d:
                        needed_one_len = d
                    needed_one_len += 1
                    if len(one) < needed_one_len:
                        one.extend([0] * (needed_one_len - len(one)))

                    end = child_one_len
                    if end > d:
                        end = d
                    for j in range(1, end):
                        one[j + 1] += child_one[j]

            return one, two

        dfs(0, -1)
        out.append(str(answer))

    sys.stdout.write("\n".join(out))


if __name__ == "__main__":
    solve()

# LeetCode Agent Instructions

Welcome to the LeetCode Workspace! This file contains strict instructions for any AI assistant (including Antigravity, Claude, Cursor, or others) operating within this directory (`/leetcode`). 

The goal of this workspace is to build a deep, conceptual understanding of algorithms and data structures through structured, step-by-step problem-solving.

---

## 📂 Directory Structure

All problems must be organized hierarchically by difficulty, then by problem number and name in kebab-case:

```text
leetcode/
├── agent.md                  # This instruction file
├── README.md                 # Master progress dashboard (auto-updated or manual)
├── easy/
│   └── 0001-two-sum/
│       ├── solution.py       # Python solution file (or other languages)
│       └── README.md         # Problem-specific explanation & breakdown
├── medium/
│   └── 0003-longest-substring-without-repeating-characters/
│       ├── solution.py
│       └── README.md
└── hard/
    └── 0004-median-of-two-sorted-arrays/
        ├── solution.py
        └── README.md
```

---

## 🛠️ Step-by-Step Workflow for New Problems

When the user asks to solve a LeetCode problem, the agent **MUST** follow these steps:

### Step 1: Create the Problem Directory
Determine the difficulty (Easy, Medium, Hard) and the standard LeetCode problem number and name. Create the directory:
`leetcode/<difficulty>/<xxxx>-<problem-name>/` (e.g., `leetcode/easy/0001-two-sum/`).

### Step 2: Create the `solution.py` File
Implement the solution code without bloated banner comments or heavy explanation comments inside the code. Keep imports, the descriptive optimized helper methods, the main LeetCode entry point method, and basic local test runners simple and concise.

```python
from typing import List

class Solution:
    def solve_brute_force(self, ...) -> ...:
        """
        Brief brute force description.
        """
        pass

    def solve_optimized(self, ...) -> ...:
        """
        Brief optimized solution description.
        """
        pass

    def <leetcode_entry_point_method>(self, ...) -> ...:
        # Delegate directly to the optimized approach
        return self.solve_optimized(...)

if __name__ == "__main__":
    solver = Solution()
    # Simple verification test cases...
```

### Step 3: Create the Problem-Specific `README.md`
Create a comprehensive, beautiful explanation file in the same directory.
This markdown file **MUST** contain the following sections:

1. **Problem Statement**: A concise description of the problem, inputs, outputs, and constraints.
2. **Comparison Table**: A clear markdown table comparing the time and space complexities of all implemented approaches.
3. **Step-by-Step Conceptual Breakdown**:
   - For the **Optimal Solution**, break down the code into its simplest form.
   - Explain what each key line or block of code does in plain, accessible language.
   - Use text-based trace tables or pointer diagrams to show how variables change state step-by-step for a sample input.
4. **Key Takeaways / Patterns**: Identify the algorithmic pattern used (e.g., Sliding Window, Fast & Slow Pointers, Monotonic Stack) and when to reuse this pattern in future problems.

---

## 🎯 Code Quality & Explanation Rules

1. **Explain conceptually before coding**: Do not output code without explaining the underlying intuition first.
2. **Breakdown of Optimal Solution**: Provide a step-by-step walkthrough of the optimal code in its simplest, most readable form. Do not gloss over complex syntax; explain the "why".
3. **Type Hinting**: Always use Python type hints (e.g., `List[int]`, `Optional[ListNode]`, `Dict[str, int]`) to keep code clean and self-documenting.
4. **Docstrings & Comments**: Keep code docstrings minimal. Focus on clean self-documenting code.
5. **No Bloated Comments in Code**: Keep the actual solution source code file (e.g. `solution.py`) completely clean, concise, and free of noisy banner line dividers (like `====...`) or block comment paragraphs. Offload all detailed step-by-step breakdowns, dry-runs, diagrams, and deep explanations to the problem's companion `README.md` file.

---

## 📈 Auto-Tracking
Whenever a new problem is solved, ensure the main `leetcode/README.md` dashboard is updated with the new problem entry, maintaining an organized table of all solved problems.

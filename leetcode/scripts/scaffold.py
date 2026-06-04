#!/usr/bin/env python3
import os
import re
import sys
import argparse

def kebab_case(s):
    # Convert to lowercase, replace non-alphanumeric with spaces, then strip and replace spaces with hyphens
    s = s.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s-]+', '-', s).strip('-')
    return s

def title_case(s):
    return " ".join(word.capitalize() for word in s.split('-'))

def generate_progress_bar(percentage):
    filled_blocks = int(round(percentage / 5))
    empty_blocks = 20 - filled_blocks
    return f"`{'█' * filled_blocks}{'░' * empty_blocks}` {percentage}%"

def update_master_readme(master_path, difficulty, problem_id, title, kebab_name):
    if not os.path.exists(master_path):
        print(f"⚠️ Master README.md not found at {master_path}. Skipping master updates.")
        return

    with open(master_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update stats table
    # Regex to find the solved count for the specific difficulty
    # Format matches: | 🟢 **Easy** | 0 | 50 | `░░░░░░░░░░░░░░░░░░░░` 0% |
    diff_icons = {
        "easy": "🟢 **Easy**",
        "medium": "🟡 **Medium**",
        "hard": "🔴 **Hard**"
    }
    
    icon_str = diff_icons.get(difficulty.lower())
    if not icon_str:
        print("⚠️ Invalid difficulty for stats update.")
        return

    # Let's find and update the count
    pattern = rf"(\|\s*{re.escape(icon_str)}\s*\|\s*)(\d+)(\s*\|\s*)(\d+)(\s*\|\s*`[^`]*` \d+%\s*\|)"
    match = re.search(pattern, content)
    
    if match:
        prefix, solved, mid, goal, suffix = match.groups()
        new_solved = int(solved) + 1
        new_percentage = int(round((new_solved / int(goal)) * 100))
        new_percentage = min(100, new_percentage) # Cap at 100%
        new_progress = generate_progress_bar(new_percentage)
        
        updated_line = f"{prefix}{new_solved}{mid}{goal}{mid}{new_progress} |"
        content = content.replace(match.group(0), updated_line)

    # 2. Update Total stats row
    # Format matches: | **Total** | **0** | **180** | **`░░░░░░░░░░░░░░░░░░░░` 0%**** |
    # Note: Sometimes there is some markdown formatting variability. Let's make the total dynamic by reading Easy/Medium/Hard.
    stats_pattern = r"\|\s*(🟢 \*\*Easy\*\*|🟡 \*\*Medium\*\*|🔴 \*\*Hard\*\*)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|"
    all_diffs = re.findall(stats_pattern, content)
    
    total_solved = sum(int(x[1]) for x in all_diffs)
    total_goal = sum(int(x[2]) for x in all_diffs)
    total_percentage = int(round((total_solved / total_goal) * 100)) if total_goal > 0 else 0
    total_percentage = min(100, total_percentage)
    total_progress = generate_progress_bar(total_percentage)
    
    total_pattern = r"(\|\s*\*\*Total\*\*\s*\|\s*\*\*)(\d+)(\*\*\s*\|\s*\*\*)(\d+)(\*\*\s*\|\s*\*\*`[^`]*` \d+%\*\*.*)"
    total_match = re.search(total_pattern, content)
    if total_match:
        prefix, _, mid, _, suffix = total_match.groups()
        updated_total_line = f"{prefix}{total_solved}{mid}{total_goal}** | **{total_progress}**"
        content = re.sub(total_pattern, updated_total_line, content)

    # 3. Add to problem log
    # Columns: | # | Problem | Difficulty | Key Pattern | Solutions | Walkthrough |
    diff_badge = {
        "easy": "🟢 Easy",
        "medium": "🟡 Medium",
        "hard": "🔴 Hard"
    }[difficulty.lower()]

    solution_link = f"[solution.py](file:///home/po/projects/personal/personal-website/leetcode/{difficulty}/{problem_id}-{kebab_name}/solution.py)"
    walkthrough_link = f"[Walkthrough](file:///home/po/projects/personal/personal-website/leetcode/{difficulty}/{problem_id}-{kebab_name}/README.md)"
    
    new_row = f"| {int(problem_id)} | {title} | {diff_badge} | *TBD* | {solution_link} | {walkthrough_link} |"

    # Insert row inside <!-- START_PROBLEM_LIST --> and <!-- END_PROBLEM_LIST -->
    start_tag = "<!-- START_PROBLEM_LIST -->"
    end_tag = "<!-- END_PROBLEM_LIST -->"
    
    if start_tag in content and end_tag in content:
        parts = content.split(start_tag)
        left = parts[0] + start_tag + "\n"
        right = parts[1]
        
        # Check if list is empty placeholder and remove it
        if "*List is currently empty. Start solving to populate the dashboard!*" in right:
            right = right.replace("*List is currently empty. Start solving to populate the dashboard!*", "")
            
        sub_parts = right.split(end_tag)
        existing_rows = sub_parts[0].strip()
        tail = end_tag + sub_parts[1]
        
        if existing_rows:
            all_rows = existing_rows.split('\n')
            all_rows.append(new_row)
            # Sort rows by problem ID numerically
            def get_row_id(row_str):
                m = re.match(r"\|\s*(\d+)\s*\|", row_str)
                return int(m.group(1)) if m else 99999
            all_rows.sort(key=get_row_id)
            updated_rows = "\n".join(all_rows) + "\n"
        else:
            updated_rows = new_row + "\n"
            
        content = left + updated_rows + tail

    with open(master_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("📈 Updated Master README dashboard successfully.")


def main():
    parser = argparse.ArgumentParser(description="Scaffold a new LeetCode problem workspace.")
    parser.add_argument("--diff", choices=["easy", "medium", "hard"], help="Difficulty level")
    parser.add_argument("--id", type=str, help="Problem number/ID (e.g. 1, 0001, 142)")
    parser.add_argument("--name", type=str, help="Problem name (e.g. 'Two Sum')")
    
    args = parser.parse_args()
    
    # Prompt interactively if missing arguments
    diff = args.diff
    while not diff:
        val = input("Select difficulty (1: Easy, 2: Medium, 3: Hard): ").strip()
        if val in ["1", "easy", "Easy"]:
            diff = "easy"
        elif val in ["2", "medium", "Medium"]:
            diff = "medium"
        elif val in ["3", "hard", "Hard"]:
            diff = "hard"
        else:
            print("Invalid selection. Try again.")

    prob_id = args.id
    while not prob_id:
        val = input("Enter LeetCode Problem ID (e.g. 1): ").strip()
        if val.isdigit():
            prob_id = f"{int(val):04d}"  # Pad with zeros to 4 digits
        else:
            print("Problem ID must be a number. Try again.")
    # Pad to 4 digits if simple integer
    if prob_id.isdigit():
        prob_id = f"{int(prob_id):04d}"

    name = args.name
    while not name:
        name = input("Enter LeetCode Problem Name (e.g. 'Two Sum'): ").strip()
        if not name:
            print("Name cannot be empty. Try again.")

    kebab_name = kebab_case(name)
    title_name = title_case(kebab_name)
    
    # Determine base directories
    script_dir = os.path.dirname(os.path.abspath(__file__))
    leetcode_root = os.path.dirname(script_dir)
    problem_dir = os.path.join(leetcode_root, diff, f"{prob_id}-{kebab_name}")
    
    if os.path.exists(problem_dir):
        print(f"❌ Error: Problem directory already exists at {problem_dir}")
        sys.exit(1)
        
    os.makedirs(problem_dir, exist_ok=True)
    print(f"📁 Created directory: {problem_dir}")
    
    # URL constructor
    leetcode_url = f"https://leetcode.com/problems/{kebab_name}/"
    
    # Write solution.py template
    sol_template = f'''from typing import List

class Solution:
    def solve_brute_force(self, *args, **kwargs) -> None:
        """
        Naive baseline solution.
        """
        pass

    def solve_optimized(self, *args, **kwargs) -> None:
        """
        Optimized solution.
        """
        pass

    # Replace with the exact LeetCode entry method name (e.g. twoSum, asteroidsDestroyed)
    # def entry_point(self, ...) -> ...:
    #     return self.solve_optimized(...)

if __name__ == "__main__":
    solver = Solution()
    print("🚀 LeetCode {int(prob_id)}: {title_name}")
'''
    sol_path = os.path.join(problem_dir, "solution.py")
    with open(sol_path, 'w', encoding='utf-8') as f:
        f.write(sol_template)
    print(f"📝 Created solution scaffold: {sol_path}")

    # Write README.md template
    readme_template = f'''# LeetCode {int(prob_id)}: {title_name}

## 🔗 Link
[LeetCode Problem - {title_name}]({leetcode_url})

## 📖 Problem Description
*(Paste problem description here)*

---

## ⚡ Complexity Comparison

| Approach | Time Complexity | Space Complexity | Notes |
| :--- | :---: | :---: | :--- |
| Brute Force | O(...) | O(...) | Naive approach. |
| Optimized | O(...) | O(...) | Key optimization choice. |

---

## 💡 Step-by-Step Code Breakdown

### Intuition
*(Explain the high-level intuition of the optimal approach)*

### Step-by-Step Explanation of Optimal Code
1. **Initial setup**: *(Explain initialization lines)*
2. **Main loop/logic**: *(Explain main traversal/dynamic programming logic)*
3. **Return value**: *(Explain what is returned and why)*

### 🔍 Dry Run Table
*(Show how state variables change over a sample input)*

| Step | Variables | Action / Decision |
| :---: | :--- | :--- |
| 0 | Setup | |
| 1 | | |

---

## 🧠 Key Takeaways & Patterns
- **Pattern name**: *(e.g., Sliding Window, Hash Map lookup)*
- **Core realization**: *(What was the key insight that unlocked the optimal complexity?)*
'''
    readme_path = os.path.join(problem_dir, "README.md")
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_template)
    print(f"📝 Created explanation README template: {readme_path}")

    # Update Master README
    master_path = os.path.join(leetcode_root, "README.md")
    update_master_readme(master_path, diff, prob_id, title_name, kebab_name)

if __name__ == "__main__":
    main()

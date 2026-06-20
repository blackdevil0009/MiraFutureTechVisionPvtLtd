import os

FILE_PATH = "backend/main.py"

def fix_main_py():
    if not os.path.exists(FILE_PATH):
        print(f"File {FILE_PATH} not found.")
        return

    with open(FILE_PATH, "r") as f:
        content = f.read()

    # Remove 'course TEXT NOT NULL,' from init_db
    # We want to be very specific to avoid accidental replacements
    target = "            course TEXT NOT NULL,\n"
    if target in content:
        print("Removing 'course' field from main.py...")
        new_content = content.replace(target, "")
        with open(FILE_PATH, "w") as f:
            f.write(new_content)
        print("Replacement successful.")
    else:
        print("'course' field not found in main.py (maybe already removed or different indentation).")

if __name__ == "__main__":
    fix_main_py()

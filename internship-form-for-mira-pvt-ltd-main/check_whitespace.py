with open("backend/main.py", "r") as f:
    lines = f.readlines()
    for i in range(48, 65):
        print(f"{i+1}: {repr(lines[i])}")

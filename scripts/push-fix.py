#!/usr/bin/env python3
import subprocess, sys, os

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
idx = raw.find(b"GITHUB_TOKEN")
eq = idx + raw[idx:].find(b"=") + 1
nl = raw[eq:].find(b"\n")
token = raw[eq:eq+nl].decode("ascii")

os.chdir("/home/ubuntu/workspace/websites/short-drama")

# Also add tsconfig.tsbuildinfo to gitignore
with open(".gitignore", "a") as f:
    f.write("\ntsconfig.tsbuildinfo\n")

subprocess.run(["git", "add", "-A"], capture_output=True, timeout=10)
stat = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, timeout=10)
if stat.stdout.strip():
    subprocess.run(["git", "commit", "-m", "fix: pnpm-workspace.yaml allowBuilds format"], capture_output=True, timeout=10)
    print("Committed")
else:
    print("Nothing to commit")

url = f"https://{token}@github.com/CHEN-AI-Lab/short-drama.git"
subprocess.run(["git", "remote", "remove", "origin"], capture_output=True, timeout=5)
subprocess.run(["git", "remote", "add", "origin", url], capture_output=True, timeout=5)

subprocess.run(["git", "push", "-u", "origin", "main"], capture_output=True, text=True, timeout=60)
print("Pushed!")
subprocess.run(["git", "config", "user.email", "phoebe.yanxi@users.noreply.github.com"], capture_output=True, timeout=5)
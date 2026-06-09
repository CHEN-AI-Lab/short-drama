#!/usr/bin/env python3
import subprocess, os

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
idx = raw.find(b"GITHUB_TOKEN")
eq = idx + raw[idx:].find(b"=") + 1
nl = raw[eq:].find(b"\n")
token = raw[eq:eq+nl].decode("ascii")

os.chdir("/home/ubuntu/workspace/websites/short-drama")
subprocess.run(["git", "add", "-A"], capture_output=True, timeout=10)
stat = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, timeout=10)
print(f"Changed files:\n{stat.stdout}")

subprocess.run(["git", "commit", "-m", "fix: pnpm-workspace allowBuilds with boolean values"], capture_output=True, timeout=10)

url = f"https://{token}@github.com/CHEN-AI-Lab/short-drama.git"
subprocess.run(["git", "remote", "remove", "origin"], capture_output=True, timeout=5)
subprocess.run(["git", "remote", "add", "origin", url], capture_output=True, timeout=5)

r = subprocess.run(["git", "push", "-u", "origin", "main"], capture_output=True, text=True, timeout=60)
print(r.stdout[-200:] if r.stdout else "")
if r.stderr:
    print(r.stderr[-300:])
print(f"Exit={r.returncode}")
if r.returncode == 0:
    print("Pushed to GitHub!")
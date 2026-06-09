#!/usr/bin/env python3
import subprocess, os, sys

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()

idx = raw.find(b"GITHUB_TOKEN")
eq = idx + raw[idx:].find(b"=") + 1
nl = raw[eq:].find(b"\n")
tval = raw[eq:eq+nl].decode("ascii").strip()

if len(tval) < 20:
    print("Bad token length", len(tval))
    sys.exit(1)

DIR = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
os.chdir(DIR)

subprocess.run(["git", "add", "-A"], capture_output=True, timeout=10)
stat = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, timeout=10)
if stat.stdout.strip():
    subprocess.run(["git", "commit", "-m", "ci: fix pnpm version conflict"], capture_output=True, timeout=10)
    print("Committed")
else:
    print("Nothing to commit")

url = f"https://{tval}@github.com/CHEN-AI-Lab/short-drama.git"
subprocess.run(["git", "remote", "remove", "origin"], capture_output=True, timeout=5)
subprocess.run(["git", "remote", "add", "origin", url], capture_output=True, timeout=5)

r = subprocess.run(["git", "push", "-u", "origin", "main"], capture_output=True, text=True, timeout=60)
print(r.stdout[-300:] if r.stdout else "")
if r.stderr:
    print(r.stderr[-300:])
print(f"Exit={r.returncode}")
if r.returncode == 0:
    print("Pushed!")
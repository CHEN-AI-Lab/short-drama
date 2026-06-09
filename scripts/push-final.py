#!/usr/bin/env python3
import subprocess, os

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
idx = raw.find(b"GITHUB_TOKEN")
eq = idx + raw[idx:].find(b"=") + 1
nl = raw[eq:].find(b"\n")
token = raw[eq:eq+nl].decode("ascii")

os.chdir("/home/ubuntu/workspace/websites/short-drama")

# Clean untracked scripts that shouldn't be in repo
for f in ["scripts/check-ci3.py", "scripts/check-ci-detail.py", "scripts/check-ci-job.py",
           "scripts/check-ci-status.py", "scripts/check-ci-raw.py", "scripts/check-ci.py",
           "scripts/check-deploy.py", "scripts/check-install-log.py", "scripts/dump-log.py",
           "scripts/dump-tail.py", "scripts/push-fix.py", "scripts/push-to-github.py"]:
    if os.path.exists(f):
        subprocess.run(["git", "rm", "--cached", f], capture_output=True, timeout=5)

subprocess.run(["git", "add", "-A"], capture_output=True, timeout=10)
stat = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, timeout=10)
print(f"Changes:\n{stat.stdout.strip()[:500]}")

subprocess.run(["git", "commit", "-m", "fix: pnpm allowBuilds values + regenerate lockfile with v11.5.2"], capture_output=True, timeout=10)

url = f"https://{token}@github.com/CHEN-AI-Lab/short-drama.git"
subprocess.run(["git", "remote", "remove", "origin"], capture_output=True, timeout=5)
subprocess.run(["git", "remote", "add", "origin", url], capture_output=True, timeout=5)

r = subprocess.run(["git", "push", "-u", "origin", "main"], capture_output=True, text=True, timeout=60)
print(r.stdout[-200:] if r.stdout else "")
if r.stderr:
    print(r.stderr[-300:])
print(f"Exit={r.returncode}")
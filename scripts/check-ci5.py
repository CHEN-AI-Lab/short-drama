#!/usr/bin/env python3
import subprocess, json

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
idx = raw.find(b"GITHUB_TOKEN")
eq = idx + raw[idx:].find(b"=") + 1
nl = raw[eq:].find(b"\n")
token = raw[eq:eq+nl].decode("ascii")

run_id = "27224193194"
url = f"https://api.github.com/repos/CHEN-AI-Lab/short-drama/actions/runs/{run_id}/jobs"
cmd = ["curl", "-s", "-L", url, "-H", f"Authorization: token {token}"]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
data = json.loads(r.stdout)

job = data["jobs"][0]
print(f"Job: {job['name']} - {job['conclusion']}")

# Get log with timeout
log_url = f"https://api.github.com/repos/CHEN-AI-Lab/short-drama/actions/jobs/{job['id']}/logs"
r2 = subprocess.run(["curl", "-s", "-L", log_url, "-H", f"Authorization: token {token}"], capture_output=True, text=True, timeout=30)
lines = r2.stdout.split("\n")
print(f"Total log lines: {len(lines)}")

# Find all error/exit lines
for i, line in enumerate(lines):
    lower = line.lower()
    if any(x in lower for x in ["error:", "exit code", "err_", "npm err", "enoent"]):
        if "##[warning]" not in line and "deprecated" not in line:
            ctx = max(0, i-2)
            for j in range(ctx, min(len(lines), i+3)):
                print(f"  [{j}] {lines[j][:200]}")
            print()
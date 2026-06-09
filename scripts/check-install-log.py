#!/usr/bin/env python3
import subprocess, sys

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
idx = raw.find(b"GITHUB_TOKEN")
eq = idx + raw[idx:].find(b"=") + 1
nl = raw[eq:].find(b"\n")
token = raw[eq:eq+nl].decode("ascii")

# Get job logs
run_id = "27223173998"
url = f"https://api.github.com/repos/CHEN-AI-Lab/short-drama/actions/runs/{run_id}/jobs"
cmd = ["curl", "-s", url, "-H", f"Authorization: token {token}", "-H", "Accept: application/vnd.github.v3+json"]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
data = __import__("json").loads(r.stdout)

job = data["jobs"][0]
log_url = f"https://api.github.com/repos/CHEN-AI-Lab/short-drama/actions/jobs/{job['id']}/logs"
r2 = subprocess.run(["curl", "-s", log_url, "-H", f"Authorization: token {token}", "-H", "Accept: application/vnd.github.v3+json"], capture_output=True, text=True, timeout=30)
lines = r2.stdout.split("\n")

# Find pnpm install error
found = False
for i, line in enumerate(lines):
    lower = line.lower()
    if any(x in lower for x in ["pnpm install", "error:", "err!", "warning:", "enoent", "not found"]):
        if "deprecated" not in lower and "##[warning]" not in lower:
            ctx_start = max(0, i - 2)
            ctx_end = min(len(lines), i + 5)
            for j in range(ctx_start, ctx_end):
                print(f"  [{j}] {lines[j][:200]}")
            found = True

if not found:
    print("No errors found in expected format. Last 40 lines:")
    for line in lines[-40:]:
        print(f"  {line[:200]}")
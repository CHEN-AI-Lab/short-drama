#!/usr/bin/env python3
import subprocess, sys

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
idx = raw.find(b"GITHUB_TOKEN")
eq = idx + raw[idx:].find(b"=") + 1
nl = raw[eq:].find(b"\n")
token = raw[eq:eq+nl].decode("ascii")

run_id = "27223173998"
url = f"https://api.github.com/repos/CHEN-AI-Lab/short-drama/actions/runs/{run_id}/jobs"
cmd = ["curl", "-s", "-L", url, "-H", f"Authorization: token {token}", "-H", "Accept: application/vnd.github.v3+json"]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
data = __import__("json").loads(r.stdout)

job = data["jobs"][0]
log_url = f"https://api.github.com/repos/CHEN-AI-Lab/short-drama/actions/jobs/{job['id']}/logs"
r2 = subprocess.run(["curl", "-s", "-L", log_url, "-H", f"Authorization: token {token}", "-H", "Accept: application/vnd.github.v3+json"], capture_output=True, text=True, timeout=30)
lines = r2.stdout.split("\n")
print(f"Total lines: {len(lines)}")
# print around "pnpm install" area
for i, line in enumerate(lines):
    if "pnpm install" in line.lower() or "run pnpm install" in line.lower():
        for j in range(max(0,i-2), min(len(lines), i+15)):
            print(f"[{j}] {lines[j][:200]}")
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
print(f"Last 50 lines:")
for line in lines[-50:]:
    print(f"  {line[:250]}")
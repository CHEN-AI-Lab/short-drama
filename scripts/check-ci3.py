#!/usr/bin/env python3
import subprocess, sys

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
idx = raw.find(b"GITHUB_TOKEN")
eq = idx + raw[idx:].find(b"=") + 1
nl = raw[eq:].find(b"\n")
token = raw[eq:eq+nl].decode("ascii")

run_id = "27223410312"
url = f"https://api.github.com/repos/CHEN-AI-Lab/short-drama/actions/runs/{run_id}/jobs"
cmd = ["curl", "-s", "-L", url, "-H", f"Authorization: token {token}", "-H", "Accept: application/vnd.github.v3+json"]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
data = __import__("json").loads(r.stdout)

for job in data.get("jobs", []):
    print(f"Job: {job['name']} - {job['conclusion']}")
    for step in job["steps"]:
        if step["conclusion"] == "failure":
            print(f"  FAILED: {step['number']}. {step['name']}")
    
    # Get full log
    log_url = f"https://api.github.com/repos/CHEN-AI-Lab/short-drama/actions/jobs/{job['id']}/logs"
    r2 = subprocess.run(["curl", "-s", "-L", log_url, "-H", f"Authorization: token {token}", "-H", "Accept: application/vnd.github.v3+json"], capture_output=True, text=True, timeout=30)
    lines = r2.stdout.split("\n")
    last_60 = lines[-60:]
    for line in last_60:
        if "error" in line.lower() and "warning" not in line.lower() and "deprecated" not in line.lower():
            print(f"  ERR: {line[:300]}")
        if "exit" in line.lower():
            print(f"  EXIT: {line[:300]}")
        if "ERR_" in line or "err_" in line:
            print(f"  PNPM: {line[:300]}")
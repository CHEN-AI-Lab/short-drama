#!/usr/bin/env python3
import subprocess, json

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
idx = raw.find(b"GITHUB_TOKEN")
eq = idx + raw[idx:].find(b"=") + 1
nl = raw[eq:].find(b"\n")
token = raw[eq:eq+nl].decode("ascii")

url = f"https://api.github.com/repos/CHEN-AI-Lab/short-drama/actions/runs?per_page=5"
cmd = ["curl", "-s", "-L", url, "-H", f"Authorization: token {token}"]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
data = json.loads(r.stdout)

for run in data.get("workflow_runs", []):
    print(f"{run['name']:8s} #{run['run_number']:3d} {run['status']:12s} {run.get('conclusion','') or '...':10s} {run['head_branch']:6s} {run['created_at'][:16]}")
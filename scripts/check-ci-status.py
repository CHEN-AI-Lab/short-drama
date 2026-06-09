#!/usr/bin/env python3
import subprocess, json, time, sys

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()

idx = raw.find(b"GITHUB_TOKEN")
eq = idx + raw[idx:].find(b"=") + 1
nl = raw[eq:].find(b"\n")
tok = raw[eq:eq+nl].decode("ascii")

AUTH = f"Authorization: token {tok}"
API = "https://api.github.com/repos/CHEN-AI-Lab/short-drama"
ACCEPT = "Accept: application/vnd.github.v3+json"

# Wait a bit for the CI to start
time.sleep(5)

# Get latest run
r = subprocess.run(["curl", "-s", f"{API}/actions/runs?per_page=1", "-H", AUTH, "-H", ACCEPT], capture_output=True, text=True, timeout=15)
data = json.loads(r.stdout)
runs = data.get("workflow_runs", [])
if runs:
    run = runs[0]
    print(f"Workflow: {run['name']} #{run['run_number']}")
    print(f"Status: {run['status']}")
    print(f"Conclusion: {run.get('conclusion','N/A')}")
    print(f"Branch: {run['head_branch']}")
    print(f"URL: {run['html_url']}")
    print(f"Event: {run['event']}")
    print(f"Created: {run['created_at']}")
else:
    print("No runs found")
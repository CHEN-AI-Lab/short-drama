#!/usr/bin/env python3
import subprocess, json, sys

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    c = f.read()
pos = c.find(b"GITHUB_TOKEN")
eq = c.find(b"=", pos)
end = c.find(b"\n", eq)
token = c[eq+1:end].decode("ascii")

API = "https://api.github.com/repos/CHEN-AI-Lab/short-drama"
AUTH = f"Authorization: token {token}"
ACCEPT = "Accept: application/vnd.github.v3+json"

# Get last failed run
r = subprocess.run(["curl", "-s", f"{API}/actions/runs?per_page=1&status=failure", "-H", AUTH, "-H", ACCEPT], capture_output=True, text=True, timeout=15)
data = json.loads(r.stdout)
runs = data.get("workflow_runs", [])
if not runs:
    print("No failed runs")
    sys.exit(0)

run = runs[0]
print(f"Run: {run['name']} #{run['run_number']}")
print(f"URL: {run['html_url']}")

# Get jobs
r2 = subprocess.run(["curl", "-s", run["jobs_url"], "-H", AUTH, "-H", ACCEPT], capture_output=True, text=True, timeout=15)
jobs = json.loads(r2.stdout)
for job in jobs.get("jobs", []):
    print(f"\nJob: {job['name']} - {job['conclusion']}")
    for step in job["steps"]:
        if step["conclusion"] == "failure":
            print(f"  Failed: {step['name']}")
    # Get logs
    r3 = subprocess.run(["curl", "-s", f"{API}/actions/jobs/{job['id']}/logs", "-H", AUTH, "-H", ACCEPT], capture_output=True, text=True, timeout=15)
    lines = r3.stdout.split("\n")
    for i, line in enumerate(lines):
        lower = line.lower()
        if any(x in lower for x in ["error:", "failed", "exit code 1", "exit code 2", "not found:", "ERR_PNPM", "ENOENT"]):
            if "deprecated" not in line and "##[warning]" not in line:
                print(f"  [{i}] {line[:300]}")

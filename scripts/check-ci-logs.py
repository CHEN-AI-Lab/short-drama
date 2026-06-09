#!/usr/bin/env python3
import requests, json, sys

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    c = f.read()
pos = c.find(b"GITHUB_TOKEN")
eq = c.find(b"=", pos)
end = c.find(b"\n", eq)
TOKEN = c[eq+1:end].decode("ascii")

HEADERS = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.v3+json"}
API = "https://api.github.com/repos/CHEN-AI-Lab/short-drama"

# Get last CI run logs
runs = requests.get(f"{API}/actions/runs?per_page=2", headers=HEADERS).json()
for run in runs.get("workflow_runs", []):
    print(f"\n=== {run['name']} (#{run['run_number']}) - {run['conclusion']} ===")
    # Get failed jobs
    jobs = requests.get(run["jobs_url"], headers=HEADERS).json()
    for job in jobs.get("jobs", []):
        print(f"  Job: {job['name']} - {job['conclusion']}")
        if job["conclusion"] == "failure":
            # Get step that failed
            for step in job["steps"]:
                if step["conclusion"] == "failure":
                    print(f"    Failed step: {step['name']}")
            # Get logs
            logs = requests.get(job["html_url"].replace("api.github.com/repos", "github.com").replace("/jobs/", "/logs/") if False else f"{API}/actions/jobs/{job['id']}/logs", headers=HEADERS, timeout=30)
            if logs.status_code == 200:
                lines = logs.text.split("\n")
                for line in lines[-15:]:
                    print(f"    | {line[:200]}")
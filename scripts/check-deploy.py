#!/usr/bin/env python3
import subprocess, json, sys, os

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    content = f.read()

marker = b"GITHUB_TOKEN"
pos = content.find(marker)
if pos < 0:
    print("ERROR: not found")
    sys.exit(1)
eq = content.find(b"=", pos)
end = content.find(b"\n", eq)
token = content[eq+1:end].decode("ascii")

# Check GitHub Actions runs
cmd = [
    "curl", "-s",
    "https://api.github.com/repos/CHEN-AI-Lab/short-drama/actions/runs?per_page=5",
    "-H", f"Authorization: token {token}"
]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
data = json.loads(r.stdout)
runs = data.get("workflow_runs", [])
if runs:
    for run in runs[:3]:
        print(f"{run['name']} | {run['status']} | {run.get('conclusion','')} | {run['html_url']}")
else:
    print("No workflow runs yet")
    # Check workflow files exist
    cmd2 = [
        "curl", "-s",
        "https://api.github.com/repos/CHEN-AI-Lab/short-drama/contents/.github/workflows",
        "-H", f"Authorization: token {token}"
    ]
    r2 = subprocess.run(cmd2, capture_output=True, text=True, timeout=30)
    wfs = json.loads(r2.stdout)
    if isinstance(wfs, list):
        for wf in wfs:
            print(f"  Wf: {wf['name']}")
    else:
        print(f"  {r2.stdout[:200]}")
    
    # Trigger deploy
    cmd3 = [
        "curl", "-s", "-X", "POST",
        "https://api.github.com/repos/CHEN-AI-Lab/short-drama/actions/workflows/deploy.yml/dispatches",
        "-H", f"Authorization: token {token}",
        "-H", "Content-Type: application/json",
        "-d", '{"ref":"main"}'
    ]
    r3 = subprocess.run(cmd3, capture_output=True, text=True, timeout=30)
    print(f"Trigger: {r3.stdout[:100]}")

print("Done")
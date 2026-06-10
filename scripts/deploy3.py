#!/usr/bin/env python3
"""Set rootDirectory via Vercel REST API and deploy."""
import subprocess, json, os

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
d = {}
for l in raw.decode("latin-1").split("\n"):
    l = l.strip()
    if "=" in l:
        k, v = l.split("=", 1)
        d[k] = v

token = d.get("VERCEL_TOKEN")
cwd = "/home/ubuntu/workspace/websites/short-drama"

# Reset vercel.json to simple framework only
with open(os.path.join(cwd, "vercel.json"), "w") as f:
    json.dump({"framework": "nextjs"}, f, indent=2)

# Get project ID
headers = f"Authorization: Bearer {token}"
r = subprocess.run([
    "curl", "-s", "https://api.vercel.com/v9/projects/short-drama?teamId=chen-ai",
    "-H", headers
], capture_output=True, text=True, timeout=15)
project = json.loads(r.stdout)
project_id = project.get("id") or project.get("projectId")
print(f"Project ID: {project_id}")

# Update rootDirectory via API
update = json.dumps({"rootDirectory": "apps/web"})
r2 = subprocess.run([
    "curl", "-s", "-X", "PATCH",
    f"https://api.vercel.com/v9/projects/{project_id}?teamId=chen-ai",
    "-H", headers, "-H", "Content-Type: application/json",
    "-d", update
], capture_output=True, text=True, timeout=15)
resp2 = json.loads(r2.stdout)
print(f"Root dir set to: {resp2.get('rootDirectory', 'NOT SET')}")

# Deploy
r3 = subprocess.run([
    "npx", "vercel", "--prod", "--yes",
    "--token", token, "--cwd", cwd
], capture_output=True, text=True, timeout=600)
print("OUTPUT:", r3.stdout[-800:])
if r3.stderr:
    print("STDERR:", r3.stderr[-500:])
print(f"Exit: {r3.returncode}")
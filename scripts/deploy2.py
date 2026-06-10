#!/usr/bin/env python3
"""Set rootDirectory and deploy on Vercel."""
import subprocess, json

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

# First, try using vercel.json without rootDirectory
import os
vercel_json = os.path.join(cwd, "vercel.json")
with open(vercel_json) as f:
    config = json.load(f)
# Remove invalid rootDirectory
config.pop("rootDirectory", None)
with open(vercel_json, "w") as f:
    json.dump(config, f, indent=2)

print("Using vercel.json:", json.dumps(config, indent=2))

# Set rootDirectory via Vercel CLI's project command
subprocess.run([
    "npx", "vercel", "project", "update", "short-drama",
    "--root", "apps/web",
    "--token", token
], capture_output=True, text=True, timeout=30)

# Deploy
r = subprocess.run([
    "npx", "vercel", "--prod", "--yes",
    "--token", token, "--cwd", cwd
], capture_output=True, text=True, timeout=600)

print("OUTPUT:", r.stdout[-800:])
if r.stderr:
    print("STDERR:", r.stderr[-500:])
print(f"Exit: {r.returncode}")
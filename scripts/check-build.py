#!/usr/bin/env python3
"""Fetch Vercel build logs."""
import subprocess, json

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
d = {}
for l in raw.decode("latin-1").split("\n"):
    l = l.strip()
    if "=" in l:
        k, v = l.split("=", 1)
        d[k] = v

token = d["VERCEL_TOKEN"]

# Get latest deployment
r = subprocess.run(["curl", "-s", "https://api.vercel.com/v12/deployments?teamId=chen-ai&limit=3", "-H", "Authorization: Bearer " + token], capture_output=True, text=True, timeout=15)
data = json.loads(r.stdout)
for dpl in data.get("deployments", []):
    uid = dpl["uid"]
    url = dpl["url"]
    state = dpl.get("readyState")
    err = dpl.get("error", {})
    err_msg = err.get("message", "none") if err else "none"
    print(f"{url}  state={state}  error={err_msg}")
    
    # Get build details
    r2 = subprocess.run(["curl", "-s", f"https://api.vercel.com/v12/deployments/{uid}?teamId=chen-ai", "-H", "Authorization: Bearer " + token], capture_output=True, text=True, timeout=15)
    dep = json.loads(r2.stdout)
    builds = dep.get("builds", [])
    for b in builds:
        bs = b.get("status", "?")
        bu = b.get("use", "?")
        print(f"  build: {bu} status={bs}")
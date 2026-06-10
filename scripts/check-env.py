#!/usr/bin/python3
"""Check Vercel project env vars."""
import subprocess, json

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
d = {}
for l in raw.decode("latin-1").split("\n"):
    l = l.strip()
    if "=" in l:
        k, v = l.split("=", 1)
        d[k] = v

tok = d["VERCEL_TOKEN"]

# Get project
r = subprocess.run(["curl", "-s", "https://api.vercel.com/v9/projects/short-drama", "-H", "Authorization: Bearer " + tok], capture_output=True, text=True, timeout=15)
proj = json.loads(r.stdout)
print("Name:", proj.get("name"))
print("RootDir:", proj.get("rootDirectory"))

# Check env vars
targets = proj.get("targets", {})
prod = targets.get("production", {})
envs = prod.get("env", {})
print(f"\nProduction env vars ({len(envs)} found):")
for k, v in envs.items():
    val = v.get("value", "")
    if val:
        print(f"  {k} = {val[:15]}... ({len(val)} chars)")
    else:
        print(f"  {k} = (no value)")
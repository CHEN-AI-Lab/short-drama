#!/usr/bin/env python3
"""Fetch Vercel deployment logs via API."""
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
auth_hdr = f"Authorization: Bearer {token}"

# Get latest deployment
r = subprocess.run([
    "curl", "-s",
    "https://api.vercel.com/v6/deployments?teamId=chen-ai&limit=1",
    "-H", auth_hdr
], capture_output=True, text=True, timeout=15)

data = json.loads(r.stdout)
deployments = data.get("deployments", [])
if not deployments:
    print("No deployments found")
    exit()

dpl = deployments[0]
uid = dpl["uid"]
url = dpl["url"]
ready_state = dpl.get("readyState")
print(f"Latest: {url}  uid={uid}  ready={ready_state}")

# Get build logs
r2 = subprocess.run([
    "curl", "-s",
    f"https://api.vercel.com/v1/deployments/{uid}/events",
    "-H", auth_hdr
], capture_output=True, text=True, timeout=15)

events = json.loads(r2.stdout)
if isinstance(events, list):
    for ev in events[-40:]:
        txt = ev.get("text", ev.get("payload", {}).get("text", ""))
        if txt:
            print(f"  [{ev.get('type','?')}] {txt[:200]}")
else:
    text = json.dumps(events, indent=2)
    print(text[:1000])
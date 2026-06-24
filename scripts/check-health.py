#!/usr/bin/env python3
"""Check Vercel runtime logs."""
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
auth = f"Authorization: Bearer *** Version 2 logs - try the main deployment URL directly
r = subprocess.run(["curl", "-s", "https://sd.aaigc.online/api/health"], capture_output=True, text=True, timeout=15)
print(f"Health check: {r.stdout[:200]}")
print(f"Status: {r.returncode}")

# Also check the 500 error page body
r2 = subprocess.run(["curl", "-sv", "https://sd.aaigc.online/", "-o", "/dev/null"], capture_output=True, text=True, timeout=15)
# Check for redirect or error
for line in r2.stderr.split("\n"):
    if any(x in line.lower() for x in ["location", "http/", "500", "error"]):
        print(line[:200])
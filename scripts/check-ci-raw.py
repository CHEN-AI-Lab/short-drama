#!/usr/bin/env python3
import subprocess, sys

with open("/home/ubuntu/workspace/global.env", "rb") as f:
    c = f.read()
pos = c.find(b"GITHUB_TOKEN")
eq = c.find(b"=", pos)
end = c.find(b"\n", eq)
token=c[eq+1...!--v4/logs"
AUTH=*** token {token}"
ACCEPT = "Accept: application/vnd.github.v3+json"

r = subprocess.run(["curl", "-s", LOG_URL, "-H", AUTH, "-H", ACCEPT], capture_output=True, text=True, timeout=30)
lines = r.stdout.split("\n")
for i, line in enumerate(lines):
    print(f"[{i}] {line[:300]}")
#!/usr/bin/python3
"""Deploy with correct build command for monorepo."""
import subprocess, json, os

# Read token from env file at runtime
with open("/home/ubuntu/workspace/global.env", "rb") as f:
    raw = f.read()
d = {}
for l in raw.decode("latin-1").split("\n"):
    l = l.strip()
    if "=" in l:
        k, v = l.split("=", 1)
        d[k] = v

tok = d["VERCEL_TOKEN"]
hd = "Authorization: " + "Bearer " + tok
cwd = "/home/ubuntu/workspace/websites/short-drama"

# Use pnpm --filter to build just the web app
vc = {
    "framework": "nextjs",
    "buildCommand": "pnpm run --filter web build",
    "installCommand": "pnpm install",
    "outputDirectory": "apps/web/.next"
}
with open(cwd + "/vercel.json", "w") as f:
    json.dump(vc, f, indent=2)
print("vercel.json written")

# Deploy
r = subprocess.run(["npx", "vercel", "--prod", "--yes", "--token", tok, "--cwd", cwd], capture_output=True, text=True, timeout=600)
print("OUTPUT:", r.stdout[-1000:])
if r.stderr:
    print("STDERR:", r.stderr[-500:])
print(f"Exit: {r.returncode}")
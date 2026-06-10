#!/usr/bin/python3
"""Deploy with no outputDirectory — let Vercel auto-detect."""
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
cwd = "/home/ubuntu/workspace/websites/short-drama"

# Minimal vercel.json — let Vercel detect everything
vc = {
    "framework": "nextjs",
    "buildCommand": "pnpm build",
    "installCommand": "pnpm install"
}
with open(cwd + "/vercel.json", "w") as f:
    json.dump(vc, f, indent=2)
print("vercel.json:", json.dumps(vc))

# Deploy
r = subprocess.run(["npx", "vercel", "--prod", "--yes", "--token", tok, "--cwd", cwd], capture_output=True, text=True, timeout=600)
print("OUTPUT:", r.stdout[-1500:])
if r.stderr:
    print("STDERR:", r.stderr[-800:])
print(f"Exit: {r.returncode}")
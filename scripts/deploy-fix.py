#!/usr/bin/python3
"""Fix Vercel project config + deploy. Token read from global.env at runtime."""
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
auth = "Authorization: Bearer " + tok

# Get project
r = subprocess.run(["curl", "-s", "https://api.vercel.com/v9/projects/short-drama", "-H", auth], capture_output=True, text=True, timeout=15)
proj = json.loads(r.stdout)
pid = proj["id"]
print(f"Current rootDirectory: {proj.get('rootDirectory')}")

# Remove rootDirectory
update = json.dumps({"rootDirectory": ""})
r2 = subprocess.run(["curl", "-s", "-X", "PATCH", f"https://api.vercel.com/v9/projects/{pid}", "-H", auth, "-H", "Content-Type: application/json", "-d", update], capture_output=True, text=True, timeout=15)
res = json.loads(r2.stdout)
print(f"New rootDirectory: '{res.get('rootDirectory')}'")

# Update vercel.json for monorepo
vercel_json = {
    "framework": "nextjs",
    "buildCommand": "cd apps/web && npx next build",
    "installCommand": "pnpm install",
    "outputDirectory": "apps/web/.next"
}
with open("/home/ubuntu/workspace/websites/short-drama/vercel.json", "w") as f:
    json.dump(vercel_json, f, indent=2)
print("vercel.json updated")

# Deploy
r3 = subprocess.run(["npx", "vercel", "--prod", "--yes", "--token", tok, "--cwd", "/home/ubuntu/workspace/websites/short-drama"], capture_output=True, text=True, timeout=600)
print("OUTPUT:", r3.stdout[-600:])
if r3.stderr: print("STDERR:", r3.stderr[-400:])
print(f"Exit: {r3.returncode}")
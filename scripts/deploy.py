#!/usr/bin/env python3
"""Set Vercel env vars and deploy."""
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

env_vars = {
    "OPENAI_API_KEY": d.get("OPENAI_API_KEY"),
    "OPENAI_BASE_URL": d.get("OPENAI_BASE_URL"),
    "OPENAI_MODEL": d.get("OPENAI_MODEL"),
    "NEXT_PUBLIC_SUPABASE_URL": d.get("NEXT_PUBLIC_SUPABASE_URL"),
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": d.get("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    "SUPABASE_SERVICE_ROLE_KEY": d.get("SUPABASE_SERVICE_ROLE_KEY"),
}

for k, v in env_vars.items():
    if not v:
        print(f"⚠ Skipping {k} (missing)")
        continue
    cmd = ["npx", "vercel", "env", "add", "production", k, v, "--yes",
           "--token", token, "--cwd", cwd]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if r.returncode == 0:
        print(f"✅ {k} set")
    else:
        print(f"❌ {k}: {r.stderr[:100]}")

print("\n--- Deploying ---")
r = subprocess.run(["npx", "vercel", "--prod", "--yes",
                     "--token", token, "--cwd", cwd],
                    capture_output=True, text=True, timeout=120)
print(r.stdout[:500])
if r.stderr:
    print(r.stderr[:300])
print(f"\nExit: {r.returncode}")
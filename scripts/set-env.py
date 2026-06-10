#!/usr/bin/python3
"""Set Vercel env vars via REST API. Token read from global.env at runtime."""
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
auth_hdr = "Authorization: Bearer " + tok

# Get project ID first
r = subprocess.run([
    "curl", "-s", "https://api.vercel.com/v9/projects/short-drama",
    "-H", auth_hdr
], capture_output=True, text=True, timeout=15)
proj = json.loads(r.stdout)
pid = proj["id"]
print(f"Project ID: {pid}")

# First, list existing envs and delete them all
r = subprocess.run([
    "curl", "-s", f"https://api.vercel.com/v10/projects/{pid}/env?teamId=chen-ai",
    "-H", auth_hdr
], capture_output=True, text=True, timeout=15)
existing = json.loads(r.stdout)
envs_list = existing if isinstance(existing, list) else existing.get("envs", [])
for e in envs_list:
    ek = e.get("key", e.get("name"))
    eid = e.get("id", e.get("uid"))
    subprocess.run([
        "curl", "-s", "-X", "DELETE",
        f"https://api.vercel.com/v10/projects/{pid}/env/{eid}?teamId=chen-ai",
        "-H", auth_hdr
    ], capture_output=True, timeout=15)
    print(f"Deleted existing: {ek}")

# Now set each env var
env_vars = {
    "OPENAI_API_KEY": "encrypted",
    "OPENAI_BASE_URL": "plain",
    "OPENAI_MODEL": "plain",
    "NEXT_PUBLIC_SUPABASE_URL": "plain",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "encrypted",
    "SUPABASE_SERVICE_ROLE_KEY": "encrypted",
}

for name, stype in env_vars.items():
    val = d.get(name)
    if not val:
        print(f"Skip {name} (not in global.env)")
        continue
    
    payload = json.dumps({
        "key": name,
        "value": val,
        "type": stype,
        "target": ["production"]
    })
    
    r2 = subprocess.run([
        "curl", "-s", "-X", "POST",
        f"https://api.vercel.com/v10/projects/{pid}/env?teamId=chen-ai",
        "-H", auth_hdr,
        "-H", "Content-Type: application/json",
        "-d", payload
    ], capture_output=True, text=True, timeout=15)
    
    resp = json.loads(r2.stdout)
    if resp.get("error"):
        print(f"FAIL {name}: {resp.get('error',{}).get('message','?')}")
    else:
        print(f"OK {name}")

print("\nDone!")
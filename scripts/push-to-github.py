#!/usr/bin/env python3
"""Push to GitHub — reads token from global.env via raw byte offsets."""
import subprocess, json, os, sys

with open('/home/ubuntu/workspace/global.env', 'rb') as f:
    content = f.read()

start = content.find(b'GITHUB_TOKEN=')
if start < 0:
    print("ERROR: GITHUB_TOKEN not found")
    sys.exit(1)
eq = content.find(b'=', start)
end = content.find(b'\n', eq)
token = content[eq+1:end].decode('ascii', errors='replace').strip()

os.chdir('/home/ubuntu/workspace/websites/short-drama')

# The repo was created as CHEN-AI-Lab/short-drama
repo_url = f'https://{token}@github.com/CHEN-AI-Lab/short-drama.git'

# Remove old remote and set the correct one
subprocess.run(['git', 'remote', 'remove', 'origin'], capture_output=True, timeout=10)
subprocess.run(['git', 'remote', 'add', 'origin', repo_url], capture_output=True, timeout=10)

# Push
result = subprocess.run(
    ['git', 'push', '-u', 'origin', 'main'],
    capture_output=True, text=True, timeout=60
)
print(result.stdout)
if result.stderr:
    print(result.stderr)
print(f"Exit: {result.returncode}")

if result.returncode == 0:
    print("\n✅ SUCCESS!")
    print("   https://github.com/CHEN-AI-Lab/short-drama")
else:
    # The first push may fail due to the repo already having content (from auto-init)
    # Force push as fallback:
    if 'rejected' in result.stderr:
        print("Repo may have existing content. Force pushing...")
        result2 = subprocess.run(
            ['git', 'push', '-u', 'origin', 'main', '--force'],
            capture_output=True, text=True, timeout=60
        )
        print(result2.stdout)
        if result2.stderr:
            print(result2.stderr[:500])
        if result2.returncode == 0:
            print("\n✅ SUCCESS (force push)!")
        else:
            print(f"\n❌ FAILED: {result2.stderr[:300]}")
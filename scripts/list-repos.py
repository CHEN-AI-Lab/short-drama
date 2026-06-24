#!/usr/bin/env python3
"""List all CHEN-AI-Lab repos."""
import urllib.request, json

with open('/home/ubuntu/workspace/global.env', 'rb') as f:
    content = f.read()
idx = content.find(b'GITHUB_TOKEN=')
eq = content.find(b'=', idx)
nl = content.find(b'\n', eq)
token = content[eq+1:nl].decode('ascii', errors='replace').strip()

req = urllib.request.Request(
    'https://api.github.com/users/CHEN-AI-Lab/repos?per_page=100',
    headers={'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}
)
resp = urllib.request.urlopen(req)
repos = json.loads(resp.read())

print(f'Total repos: {len(repos)}')
print()
for r in repos:
    print(f'  {r["name"]:30s}  private={r["private"]}  pushed={r["pushed_at"][:10]}  homepage={r.get("homepage") or ""}')
#!/usr/bin/env python3
"""Check Vercel domain DNS status."""
import urllib.request, json

with open('/home/ubuntu/workspace/global.env', 'rb') as f:
    content = f.read()
idx = content.find(b'VERCEL_TOKEN=')
eq = content.find(b'=', idx)
nl = content.find(b'\n', eq)
token = content[eq+1:nl].decode('ascii', errors='replace').strip()

# Check the domain configuration on Vercel
req = urllib.request.Request(
    'https://api.vercel.com/v6/domains/sd.aaigc.online?teamId=team_ZryCBRdsQ5bizRQiunM3NAg0',
    headers={'Authorization': f'Bearer {token}'}
)
try:
    resp = urllib.request.urlopen(req)
    print(json.dumps(json.loads(resp.read()), indent=2, ensure_ascii=False))
except urllib.error.HTTPError as e:
    print(f'Error: {e.code}')
    print(e.read().decode())
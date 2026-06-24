#!/usr/bin/env python3
"""Check Vercel DNS records for the domain."""
import urllib.request, json

with open('/home/ubuntu/workspace/global.env', 'rb') as f:
    content = f.read()

# Find VERCEL_TOKEN
idx = content.find(b'VERCEL_TOKEN')
eq = content.find(61, idx)  # 61 = ord('=')
nl = content.find(10, eq)   # 10 = ord('\n')
token = content[eq+1:nl].decode('ascii', errors='replace').strip()

# Check DNS records
req = urllib.request.Request(
    'https://api.vercel.com/v1/domains/aaigc.online/records?teamId=team_ZryCBRdsQ5bizRQiunM3NAg0',
    headers={'Authorization': 'Bearer ' + token}
)
try:
    resp = urllib.request.urlopen(req)
    print(json.dumps(json.loads(resp.read()), indent=2, ensure_ascii=False))
except urllib.error.HTTPError as e:
    print('Error:', e.code)
    print(e.read().decode())
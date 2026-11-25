#!/usr/bin/env python3
import os
from pathlib import Path
import re
import sys

token = sys.stdin.readline().strip()
if not re.fullmatch(r'[A-Za-z0-9_./+=-]{40,}', token):
    raise SystemExit('Invalid tunnel token')
target = Path(__file__).resolve().parent / '.env'
lines = [line for line in target.read_text().splitlines() if not line.startswith('TUNNEL_TOKEN=')]
target.write_text('\n'.join(lines) + '\nTUNNEL_TOKEN=' + token + '\n')
os.chmod(target, 0o600)
print('Saved the FuelOps tunnel token securely')

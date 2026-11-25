#!/usr/bin/env python3
"""Create fresh deployment credentials on the server. Never print secrets."""
import os
from pathlib import Path
import secrets
from datetime import date

target = Path(__file__).resolve().parent / '.env'
if target.exists():
    print('Existing deployment environment preserved')
else:
    values = {
        'DOMAIN': 'fuelops.dayle.dev',
        'DEMO_DATA_DATE': date.today().isoformat(),
        'POSTGRES_PASSWORD': secrets.token_hex(32),
        'MONGO_PASSWORD': secrets.token_hex(32),
        'MONGO_REPLICA_KEY': secrets.token_hex(64),
        'JWT_SECRET': secrets.token_hex(64),
        'ADMIN_EMAIL': 'admin@fuelops.dayle.dev',
        'ADMIN_PASSWORD': secrets.token_urlsafe(24),
    }
    fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as file:
        file.write('\n'.join(f'{key}={value}' for key, value in values.items()) + '\n')
    print('Created deployment environment with independent random credentials')

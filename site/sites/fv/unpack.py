#!/usr/bin/env python3
# unpack.py - res/ is stored in the repo as res.json (base64 text); run this before mkfvimg.py / mkfv.py
import os, json, base64
HERE = os.path.dirname(os.path.abspath(__file__)); RES = os.path.join(HERE, 'res'); os.makedirs(RES, exist_ok=True)
for name, b64 in json.load(open(os.path.join(HERE, 'res.json'))).items():
    open(os.path.join(RES, name), 'wb').write(base64.b64decode(b64))
print('unpacked into', RES)

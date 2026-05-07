"""
Run this once before loading the extension:
    python3 scripts/generate_icons.py

Generates icons/icon16.png, icons/icon48.png, icons/icon128.png
using only the Python standard library.
"""

import struct
import zlib
import os

def make_png(size, r, g, b):
    def chunk(name, data):
        crc = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', crc)

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
    raw = b''.join(b'\x00' + bytes([r, g, b] * size) for _ in range(size))
    idat = zlib.compress(raw)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', idat)
    png += chunk(b'IEND', b'')
    return png

# Indigo #4f46e5 → R=79, G=70, B=229
R, G, B = 79, 70, 229

icons_dir = os.path.join(os.path.dirname(__file__), '..', 'icons')
os.makedirs(icons_dir, exist_ok=True)

for size in (16, 48, 128):
    path = os.path.join(icons_dir, f'icon{size}.png')
    with open(path, 'wb') as f:
        f.write(make_png(size, R, G, B))
    print(f'Created {path}')

print('Icons generated. Load the extension in Chrome.')

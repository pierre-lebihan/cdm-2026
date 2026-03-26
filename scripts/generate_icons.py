#!/usr/bin/env python3
"""
Generate all favicon and PWA icon sizes from logo.svg
"""

import cairosvg
from PIL import Image
import io
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)

SVG_SOURCE = os.path.join(ROOT_DIR, "src", "assets", "logo.svg")
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")

def svg_to_png_bytes(svg_path: str, size: int) -> bytes:
    return cairosvg.svg2png(url=svg_path, output_width=size, output_height=size)

def save_png(data: bytes, path: str):
    with open(path, "wb") as f:
        f.write(data)
    print(f"  ✓ {os.path.basename(path)} ({os.path.getsize(path)//1024} KB)")

def generate_favicon_ico(svg_path: str, ico_path: str):
    """Generate multi-size favicon.ico (16, 32, 48)"""
    images = []
    for size in [16, 32, 48]:
        data = svg_to_png_bytes(svg_path, size)
        img = Image.open(io.BytesIO(data)).convert("RGBA")
        images.append(img)
    images[0].save(
        ico_path,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=images[1:]
    )
    print(f"  ✓ favicon.ico (multi-size: 16×16, 32×32, 48×48)")

print("Generating icons from logo.svg...")
print()

# PNG sizes for PWA manifest
sizes = [192, 256, 384, 512]
for size in sizes:
    data = svg_to_png_bytes(SVG_SOURCE, size)
    out = os.path.join(PUBLIC_DIR, f"icon-{size}x{size}.png")
    save_png(data, out)

# favicon.ico
generate_favicon_ico(SVG_SOURCE, os.path.join(PUBLIC_DIR, "favicon.ico"))

# Also save a 32px PNG for the <link rel="icon"> fallback
data32 = svg_to_png_bytes(SVG_SOURCE, 32)
save_png(data32, os.path.join(PUBLIC_DIR, "favicon-32x32.png"))

# 180px Apple touch icon
data180 = svg_to_png_bytes(SVG_SOURCE, 180)
save_png(data180, os.path.join(PUBLIC_DIR, "apple-touch-icon.png"))

print()
print("All icons generated successfully!")

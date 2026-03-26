from pathlib import Path

import cv2
import numpy as np
from PIL import Image

# Decoupe verticale du triptyque Gemini (gouttieres grises entre les badges),
# pas des tiers egaux : sinon le cercle mexicain deborde sur le visuel USA.
SPLIT_MEXICO_END = 995
SPLIT_USA_END = 1860

# Rogne commun en bas (zone de jointures / artefacts), les trois visuels.
CROP_BOTTOM_PX = 150


def split_three(src: Path) -> tuple[Image.Image, Image.Image, Image.Image]:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    left = im.crop((0, 0, SPLIT_MEXICO_END, h))
    center = im.crop((SPLIT_MEXICO_END, 0, SPLIT_USA_END, h))
    right = im.crop((SPLIT_USA_END, 0, w, h))
    return left, center, right


def is_outer_canvas_rgb(rgb: np.ndarray) -> bool:
    r = int(rgb[0])
    g = int(rgb[1])
    b = int(rgb[2])
    return r > 218 and g > 218 and b > 218


def transparent_canvas_connected_to_edges(rgb: np.ndarray) -> np.ndarray:
    h, w = rgb.shape[:2]
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    lo = (22, 22, 22)
    up = (22, 22, 22)
    flags = cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE | 8
    accumulated = np.zeros((h, w), dtype=np.uint8)
    corner_cells = [
        (0, 0),
        (1, 0),
        (0, 1),
        (1, 1),
        (w - 1, 0),
        (w - 2, 0),
        (w - 1, 1),
        (w - 2, 1),
        (0, h - 1),
        (1, h - 1),
        (0, h - 2),
        (1, h - 2),
        (w - 1, h - 1),
        (w - 2, h - 1),
        (w - 1, h - 2),
        (w - 2, h - 2),
        (w // 2, 0),
        (w // 2, 1),
        (w // 2, h - 1),
        (w // 2, h - 2),
    ]
    seeds = []
    seen = set()
    for sx, sy in corner_cells:
        if sx < 0 or sy < 0 or sx >= w or sy >= h:
            continue
        if (sx, sy) in seen:
            continue
        seen.add((sx, sy))
        if is_outer_canvas_rgb(rgb[sy, sx]):
            seeds.append((sx, sy))
    for sx, sy in seeds:
        mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
        img = bgr.copy()
        cv2.floodFill(img, mask, (sx, sy), (0, 0, 0), lo, up, flags)
        accumulated = np.maximum(accumulated, mask[1:-1, 1:-1])
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, :3] = rgb
    out[:, :, 3] = 255
    out[accumulated > 0, 3] = 0
    return out


def is_drab_gray_edge(r: int, g: int, b: int) -> bool:
    mx = max(r, g, b)
    mn = min(r, g, b)
    if mx - mn > 14:
        return False
    avg = (r + g + b) // 3
    return 125 <= avg <= 195


def usa_strip_edge_canvas_only(rgb: np.ndarray, rgba: np.ndarray) -> None:
    h, w = rgb.shape[:2]
    corners = np.array(
        [rgb[0, 0], rgb[0, w - 1], rgb[h - 1, 0], rgb[h - 1, w - 1]],
        dtype=np.float32,
    )
    ref = corners.mean(axis=0)
    rch = rgb[:, :, 0].astype(np.float32)
    gch = rgb[:, :, 1].astype(np.float32)
    bch = rgb[:, :, 2].astype(np.float32)
    lum = (rch + gch + bch) / 3.0
    chroma = np.maximum(np.maximum(rch, gch), bch) - np.minimum(np.minimum(rch, gch), bch)
    mn = np.minimum(np.minimum(rch, gch), bch)
    dr = rch - ref[0]
    dg = gch - ref[1]
    db = bch - ref[2]
    dist = np.sqrt(dr * dr + dg * dg + db * db)
    yy = np.arange(h, dtype=np.int32)[:, None]
    xx = np.arange(w, dtype=np.int32)[None, :]
    band_x = 44
    band_top = 56
    band_bot = 100
    edge = (
        (xx < band_x)
        | (xx >= w - band_x)
        | (yy < band_top)
        | (yy >= h - band_bot)
    )
    looks_canvas = (
        (lum > 158.0)
        & (lum < 252.0)
        & (chroma < 52.0)
        & (dist < 48.0)
        & (mn < 248.0)
    )
    mask = edge & looks_canvas & (rgba[:, :, 3] > 0)
    rgba[mask, 3] = 0


def lumberjack_strip_bottom_corner_seams(rgb: np.ndarray, rgba: np.ndarray) -> None:
    h, w = rgb.shape[:2]
    corners = np.array(
        [rgb[0, 0], rgb[0, w - 1], rgb[h - 1, 0], rgb[h - 1, w - 1]],
        dtype=np.float32,
    )
    ref = corners.mean(axis=0)
    rch = rgb[:, :, 0].astype(np.float32)
    gch = rgb[:, :, 1].astype(np.float32)
    bch = rgb[:, :, 2].astype(np.float32)
    lum = (rch + gch + bch) / 3.0
    chroma = np.maximum(np.maximum(rch, gch), bch) - np.minimum(np.minimum(rch, gch), bch)
    dr = rch - ref[0]
    dg = gch - ref[1]
    db = bch - ref[2]
    dist = np.sqrt(dr * dr + dg * dg + db * db)
    yy = np.arange(h, dtype=np.int32)[:, None]
    xx = np.arange(w, dtype=np.int32)[None, :]
    band = 52
    lower = yy >= int(h * 0.62)
    side = (xx < band) | (xx >= w - band)
    mask = (
        lower
        & side
        & (lum > 198.0)
        & (lum < 238.0)
        & (chroma < 26.0)
        & (dist < 38.0)
        & (rgba[:, :, 3] > 0)
    )
    rgba[mask, 3] = 0


def strip_gray_edge_artifacts(rgba: np.ndarray) -> None:
    h, w = rgba.shape[:2]
    band = 4

    for y in range(h):
        for x in range(w):
            if x >= band and x < w - band and y >= band and y < h - band:
                continue
            r = int(rgba[y, x, 0])
            g = int(rgba[y, x, 1])
            b = int(rgba[y, x, 2])
            if rgba[y, x, 3] == 0:
                continue
            if not is_drab_gray_edge(r, g, b):
                continue
            rgba[y, x, 3] = 0


def process_crop(im_rgba: Image.Image, variant: str) -> Image.Image:
    rgb = np.array(im_rgba.convert("RGB"))
    rgba = transparent_canvas_connected_to_edges(rgb)
    strip_gray_edge_artifacts(rgba)
    if variant == "usa":
        usa_strip_edge_canvas_only(rgb, rgba)
    if variant == "lumberjack":
        lumberjack_strip_bottom_corner_seams(rgb, rgba)
    out = Image.fromarray(rgba, mode="RGBA")
    ow, oh = out.size
    if oh > CROP_BOTTOM_PX:
        out = out.crop((0, 0, ow, oh - CROP_BOTTOM_PX))
    return out


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    src = root / "src/assets/icons/Gemini_Generated_Image_hqiiffhqiiffhqii.png"
    out_dir = root / "src/assets/icons"
    left, center, right = split_three(src)

    jobs = [
        ("mascot-mexico.png", left, "mexico"),
        ("mascot-usa.png", center, "usa"),
        ("mascot-lumberjack.png", right, "lumberjack"),
    ]

    for name, crop, variant in jobs:
        out = process_crop(crop, variant)
        out_path = out_dir / name
        out.save(out_path, "PNG")
        print("wrote", out_path)


if __name__ == "__main__":
    main()

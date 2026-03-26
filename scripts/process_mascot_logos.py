from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove


def split_three(src: Path) -> tuple[Image.Image, Image.Image, Image.Image]:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    third = w // 3
    left = im.crop((0, 0, third, h))
    center = im.crop((third, 0, third * 2, h))
    right = im.crop((third * 2, 0, w, h))
    return left, center, right


def remove_gray_crosshatch(im_rgba: Image.Image) -> Image.Image:
    pixels = im_rgba.load()
    w, h = im_rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            mx = max(r, g, b)
            mn = min(r, g, b)
            if mx - mn > 28:
                continue
            avg = (r + g + b) // 3
            if 95 <= avg <= 210:
                pixels[x, y] = (r, g, b, 0)
    return im_rgba


def mexico_gap_is_scenery(r: int, g: int, b: int) -> bool:
    mx = max(r, g, b)
    mn = min(r, g, b)
    if mx - mn <= 26 and 105 <= (r + g + b) // 3 <= 205:
        return True
    if r > 125 and g > 85 and b < 115 and r >= g - 35:
        return True
    if r > 200 and g > 185 and b > 140:
        return True
    if g > r + 22 and g > b + 18 and g > 85 and r < 170:
        return True
    return False


def usa_gap_is_scenery(r: int, g: int, b: int) -> bool:
    mx = max(r, g, b)
    mn = min(r, g, b)
    if mx - mn <= 24 and 100 <= (r + g + b) // 3 <= 220:
        return True
    if r < 55 and g < 95 and b > 115:
        return True
    if r > 175 and g < 95 and b < 95:
        return True
    if r > 225 and g > 225 and b > 225:
        return True
    return False


def lumberjack_gap_is_scenery(r: int, g: int, b: int) -> bool:
    mx = max(r, g, b)
    mn = min(r, g, b)
    if mx - mn <= 26 and 100 <= (r + g + b) // 3 <= 210:
        return True
    if r > 130 and g > 115 and b < 130 and r < 200:
        return True
    if b > r + 25 and b > g + 15 and b > 95:
        return True
    if g > r + 20 and g > b + 10 and 90 < g < 200 and r < 180:
        return True
    return False


def strip_scenery_gap(
    full_rgba: Image.Image,
    human_rgba: Image.Image,
    gap_fn,
) -> Image.Image:
    u = np.array(full_rgba.convert("RGBA"))
    h = np.array(human_rgba.convert("RGBA"))
    out = u.copy()
    hu, wu = u.shape[:2]
    hh, wh = h.shape[:2]
    if (hu, wu) != (hh, wh):
        h = np.array(
            Image.fromarray(h).resize((wu, hu), Image.Resampling.LANCZOS),
        )
    for y in range(hu):
        for x in range(wu):
            if u[y, x, 3] < 40:
                continue
            if h[y, x, 3] > 100:
                continue
            r, g, b = int(u[y, x, 0]), int(u[y, x, 1]), int(u[y, x, 2])
            if gap_fn(r, g, b):
                out[y, x, 3] = 0
    return Image.fromarray(out)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    src = root / "src/assets/icons/Gemini_Generated_Image_hqiiffhqiiffhqii.png"
    out_dir = root / "src/assets/icons"
    left, center, right = split_three(src)
    center_clean = remove_gray_crosshatch(center)

    sess_full = new_session("u2net")
    sess_human = new_session("u2net_human_seg")

    jobs = [
        ("mascot-mexico.png", left, mexico_gap_is_scenery),
        ("mascot-usa.png", center_clean, usa_gap_is_scenery),
        ("mascot-lumberjack.png", right, lumberjack_gap_is_scenery),
    ]

    for name, crop, gap_fn in jobs:
        full = remove(crop, session=sess_full)
        human = remove(crop, session=sess_human)
        out = strip_scenery_gap(full, human, gap_fn)
        out_path = out_dir / name
        out.save(out_path, "PNG")
        print("wrote", out_path)


if __name__ == "__main__":
    main()

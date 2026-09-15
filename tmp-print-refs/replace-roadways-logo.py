from pathlib import Path
from PIL import Image

src = Path(
    r"C:\Users\jiten\.cursor\projects\e-project-vmcindia\assets"
    r"\c__Users_jiten_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"30ef61ed2ec38368630d51fd206ef215_images_"
    r"296b1523-e43c-4434-9532-552e44e6f26b-554e601f-1e84-4946-9bf0-8ad0da5b07ae.jpg"
)
dest = Path(r"e:/project/vmcindia/public/roadways-logo.png")

im = Image.open(src).convert("RGBA")
# Trim near-white margins for cleaner letterhead/print fit
bg = im.getpixel((0, 0))
# Only auto-crop if corners are near white
def near_white(px):
    return px[0] > 245 and px[1] > 245 and px[2] > 245 and (len(px) < 4 or px[3] > 200)

if near_white(bg):
    bbox = im.getbbox()
    # Prefer alpha bbox; for opaque white use pixel scan
    pixels = im.load()
    w, h = im.size
    left, top, right, bottom = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            p = pixels[x, y]
            if not near_white(p):
                left = min(left, x)
                top = min(top, y)
                right = max(right, x)
                bottom = max(bottom, y)
    if right > left and bottom > top:
        pad = 8
        im = im.crop(
            (
                max(0, left - pad),
                max(0, top - pad),
                min(w, right + 1 + pad),
                min(h, bottom + 1 + pad),
            )
        )

# Downscale for print/web while keeping sharpness
max_w = 720
if im.width > max_w:
    ratio = max_w / im.width
    im = im.resize((max_w, int(im.height * ratio)), Image.Resampling.LANCZOS)

im.save(dest, format="PNG", optimize=True)
print("saved", dest, im.size, "bytes", dest.stat().st_size)

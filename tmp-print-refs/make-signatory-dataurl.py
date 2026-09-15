from pathlib import Path
import base64

src = Path(r"e:/project/vmcindia/public/dpr-authorized-signatory.png")
b64 = base64.b64encode(src.read_bytes()).decode("ascii")
out = Path(r"e:/project/vmcindia/src/lib/dpr-authorized-signatory-data.ts")
out.write_text(
    "export const dprAuthorizedSignatoryDataUrl =\n"
    f'  "data:image/png;base64,{b64}";\n',
    encoding="utf-8",
)
print("wrote", out, "bytes", out.stat().st_size)

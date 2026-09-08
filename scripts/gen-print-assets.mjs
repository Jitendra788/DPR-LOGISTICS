import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public");
const files = {
  dprLogoHeader: "dpr-logo-header.png",
  dprStamp: "dpr-stamp.png",
  roadwaysLogo: "roadways-logo.png",
  roadwaysStamp: "roadways-stamp.png",
  roadwaysSignature: "roadways-signature.png",
};

let out = "/** Inlined print assets — avoid slow/missing logo & stamp on print. */\n";
for (const [key, file] of Object.entries(files)) {
  const buf = fs.readFileSync(path.join(root, file));
  const b64 = buf.toString("base64");
  out += `export const ${key}DataUrl =\n  "data:image/png;base64,${b64}";\n\n`;
  console.log(key, Math.round(buf.length / 1024) + "KB");
}

const dest = path.join(__dirname, "..", "src", "lib", "print-assets.ts");
fs.writeFileSync(dest, out);
console.log("wrote", dest, Math.round(fs.statSync(dest).size / 1024) + "KB");

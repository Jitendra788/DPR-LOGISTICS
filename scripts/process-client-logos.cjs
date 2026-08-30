const https = require("https");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { URL } = require("url");

function fetch(url, n = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 25000 },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && n < 5) {
          res.resume();
          return fetch(new URL(res.headers.location, url).href, n + 1).then(resolve, reject);
        }
        const chunks = [];
        res.on("data", (d) => chunks.push(d));
        res.on("end", () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks) }));
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

const dir = path.join("public", "marketing", "clients");

const svgs = {
  "godawari.svg": `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" role="img" aria-label="Godawari Udyog">
  <rect width="320" height="120" fill="#fff"/>
  <text x="160" y="52" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#5c2e1f" font-weight="600">Godawari</text>
  <path d="M118 40c6-10 14-14 18-8" fill="none" stroke="#2f9e44" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="138" cy="30" rx="7" ry="10" fill="#3cb043" transform="rotate(-20 138 30)"/>
  <ellipse cx="148" cy="28" rx="6" ry="9" fill="#2f9e44" transform="rotate(15 148 28)"/>
  <path d="M90 62 Q160 72 230 62" fill="none" stroke="#3cb043" stroke-width="3" stroke-linecap="round"/>
  <text x="160" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#5c2e1f">udyog</text>
</svg>`,

  "epic-yarns.svg": `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140" role="img" aria-label="Epic Yarns">
  <rect width="320" height="140" fill="#fff"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#9aa3ad"/>
      <stop offset="100%" stop-color="#d4a017"/>
    </linearGradient>
  </defs>
  <path d="M120 30 A40 40 0 1 0 120 100" fill="none" stroke="url(#g)" stroke-width="6" stroke-linecap="round"/>
  <path d="M145 42 h30 M140 52 h40 M135 62 h50 M140 72 h40 M145 82 h30 M150 92 h20" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
  <text x="160" y="118" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="#111" font-weight="800" letter-spacing="1">EPIC YARNS</text>
  <text x="160" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#444">Private Limited</text>
</svg>`,

  "aditya-birla.svg": `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="Aditya Birla Group">
  <rect width="160" height="160" fill="#fff"/>
  <g transform="translate(80,80)">
    ${Array.from({ length: 24 }, (_, i) => {
      const a = (i * Math.PI * 2) / 24;
      const x1 = Math.cos(a) * 34;
      const y1 = Math.sin(a) * 34;
      const x2 = Math.cos(a) * 62;
      const y2 = Math.sin(a) * 62;
      return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q${((x1 + x2) / 2 + Math.cos(a + 0.2) * 8).toFixed(1)} ${((y1 + y2) / 2 + Math.sin(a + 0.2) * 8).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="#f5c518" stroke-width="7" stroke-linecap="round"/>`;
    }).join("")}
    <circle r="28" fill="#c41230"/>
    <circle r="18" fill="#1a1a1a"/>
    <circle r="10" fill="#f5c518"/>
  </g>
</svg>`,

  "sr-tyres.svg": `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" role="img" aria-label="SJR Tyres">
  <rect width="320" height="110" rx="8" fill="#111"/>
  <text x="28" y="72" font-family="Arial Black, Impact, sans-serif" font-size="58" fill="#f97316" font-weight="900" letter-spacing="-2">SJR</text>
  <text x="175" y="40" font-family="Arial, sans-serif" font-size="12" fill="#f97316">TM</text>
  <text x="170" y="78" font-family="Arial, sans-serif" font-size="22" fill="#fb923c" font-weight="700" letter-spacing="3">TYRES</text>
</svg>`,
};

(async () => {
  for (const [name, svg] of Object.entries(svgs)) {
    fs.writeFileSync(path.join(dir, name), svg);
    const pngName = name.replace(".svg", ".png");
    await sharp(Buffer.from(svg))
      .resize({ width: 480, height: 200, fit: "contain", background: "#ffffff" })
      .png()
      .toFile(path.join(dir, pngName));
    console.log("SVG->PNG", pngName);
  }

  // Process official downloads: white bg + consistent size
  const official = [
    ["indo-count.png", { removeBlack: true }],
    ["ghodawat.png", {}],
    ["sgg.png", {}],
  ];

  // Prefer larger ghodawat if available
  try {
    const r = await fetch("https://ghodawatconsumer.com/wp-content/uploads/2024/04/logo.png");
    if (r.status === 200 && r.buf.length > 1000) {
      fs.writeFileSync(path.join(dir, "ghodawat-src.png"), r.buf);
      console.log("ghodawat src", r.buf.length);
    }
  } catch (e) {
    console.log("ghodawat fetch", e.message);
  }

  for (const [name, opts] of official) {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) continue;
    let img = sharp(file).ensureAlpha();
    if (opts.removeBlack) {
      // make near-black transparent then flatten white
      const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r < 35 && g < 35 && b < 35) data[i + 3] = 0;
      }
      img = sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } });
    }
    await img
      .flatten({ background: "#ffffff" })
      .resize({ width: 420, height: 180, fit: "contain", background: "#ffffff" })
      .png()
      .toFile(path.join(dir, name.replace(".png", "-hq.png")));
    console.log("HQ", name);
  }

  // Final set used by site
  const map = [
    ["indo-count.png", "indo-count-hq.png"],
    ["ghodawat.png", "ghodawat-hq.png"],
    ["sun-gear.png", "aditya-birla.png"],
    ["sr-tyres.png", "sr-tyres.png"], // svg version already wrote this
    ["godawari.png", "godawari.png"],
    ["epic-yarns.png", "epic-yarns.png"],
  ];

  // Copy HQ names into final filenames carefully
  if (fs.existsSync(path.join(dir, "indo-count-hq.png"))) {
    fs.copyFileSync(path.join(dir, "indo-count-hq.png"), path.join(dir, "indo-count.png"));
  }
  if (fs.existsSync(path.join(dir, "ghodawat-hq.png"))) {
    fs.copyFileSync(path.join(dir, "ghodawat-hq.png"), path.join(dir, "ghodawat.png"));
  } else if (fs.existsSync(path.join(dir, "ghodawat-src.png"))) {
    await sharp(path.join(dir, "ghodawat-src.png"))
      .flatten({ background: "#ffffff" })
      .resize({ width: 420, height: 180, fit: "contain", background: "#ffffff" })
      .png()
      .toFile(path.join(dir, "ghodawat.png"));
  }
  if (fs.existsSync(path.join(dir, "aditya-birla.png"))) {
    fs.copyFileSync(path.join(dir, "aditya-birla.png"), path.join(dir, "sun-gear.png"));
  }

  console.log("done", fs.readdirSync(dir).filter((f) => f.endsWith(".png") || f.endsWith(".svg")));
})();

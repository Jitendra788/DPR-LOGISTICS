const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

function fetch(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,image/*,*/*",
        },
        timeout: 25000,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 5) {
          const next = new URL(res.headers.location, url).href;
          res.resume();
          return fetch(next, redirects + 1).then(resolve, reject);
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            buf: Buffer.concat(chunks),
            type: res.headers["content-type"] || "",
            url,
          });
        });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

function findLogoCandidates(html, base) {
  const urls = new Set();
  const patterns = [
    /(?:src|href)=["']([^"']*logo[^"']*\.(?:png|svg|jpg|jpeg|webp))["']/gi,
    /(?:src|href)=["']([^"']*brand[^"']*\.(?:png|svg|jpg|jpeg|webp))["']/gi,
    /content=["'](https?:\/\/[^"']+\.(?:png|svg|jpg|jpeg|webp))["']/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html))) {
      try {
        urls.add(new URL(m[1], base).href);
      } catch {
        /* ignore */
      }
    }
  }
  return [...urls];
}

async function download(url, dest) {
  const r = await fetch(url);
  if (r.status !== 200 || r.buf.length < 500) throw new Error(`bad ${r.status} ${r.buf.length}`);
  fs.writeFileSync(dest, r.buf);
  return { bytes: r.buf.length, type: r.type, url: r.url };
}

(async () => {
  const outDir = path.join("public", "marketing", "clients");
  fs.mkdirSync(outDir, { recursive: true });

  const sites = [
    "https://www.indocount.com/",
    "https://ghodawatconsumer.com/",
    "https://www.ghodawat.com/",
    "https://sjrtyres.in/",
    "https://www.adityabirla.com/",
  ];

  for (const site of sites) {
    try {
      const r = await fetch(site);
      const html = r.buf.toString("utf8");
      console.log("\n===", site, r.status, "html", html.length);
      const logos = findLogoCandidates(html, site);
      console.log(logos.slice(0, 15).join("\n") || "(none)");
    } catch (e) {
      console.log("ERR", site, e.message);
    }
  }

  // Known good CDN / Wikimedia / Clearbit-style attempts
  const known = [
    ["indo-count-hq.png", "https://logo.clearbit.com/indocount.com"],
    ["ghodawat-hq.png", "https://logo.clearbit.com/ghodawatconsumer.com"],
    ["ghodawat-sgg.png", "https://logo.clearbit.com/ghodawat.com"],
    ["sjr-hq.png", "https://logo.clearbit.com/sjrtyres.in"],
    ["aditya-hq.png", "https://logo.clearbit.com/adityabirla.com"],
    ["godawari-hq.png", "https://logo.clearbit.com/corngrit.com"],
    ["epic-hq.png", "https://logo.clearbit.com/epicyarns.in"],
  ];

  console.log("\n--- downloads ---");
  for (const [name, url] of known) {
    try {
      const info = await download(url, path.join(outDir, name));
      console.log("OK", name, info.bytes, info.type);
    } catch (e) {
      console.log("FAIL", name, e.message);
    }
  }
})();

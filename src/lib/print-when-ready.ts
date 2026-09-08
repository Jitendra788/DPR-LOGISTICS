/** Wait until print images are decoded, then open the browser print dialog. */
export function printWhenReady(delayMs = 200) {
  if (typeof window === "undefined") return;

  const trigger = () => {
    requestAnimationFrame(() => {
      setTimeout(() => window.print(), delayMs);
    });
  };

  const imgs = Array.from(document.images).filter((img) => {
    const src = img.currentSrc || img.src || "";
    return Boolean(src) && !src.startsWith("data:image/svg");
  });

  if (!imgs.length) {
    trigger();
    return;
  }

  const ready = (img: HTMLImageElement) =>
    img.complete && img.naturalWidth > 0;

  Promise.all(
    imgs.map(async (img) => {
      if (ready(img)) {
        try {
          if (typeof img.decode === "function") await img.decode();
        } catch {
          /* already painted or decode unavailable */
        }
        return;
      }

      await new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
        // Force a re-fetch if the browser left a broken incomplete image
        if (!img.complete && img.src) {
          const src = img.src;
          img.src = "";
          img.src = src;
        }
      });

      try {
        if (typeof img.decode === "function" && img.naturalWidth > 0) {
          await img.decode();
        }
      } catch {
        /* ignore */
      }
    }),
  )
    .catch(() => undefined)
    .finally(trigger);
}

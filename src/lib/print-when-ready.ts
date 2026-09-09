/** Scale print sheets to page width so Portrait + Landscape both keep headers readable. */
function resetPrintSheets() {
  document
    .querySelectorAll<HTMLElement>(
      ".bill-print-sheet, .lr-print-sheet, .lhc-memo-sheet, .lm-sheet",
    )
    .forEach((el) => {
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.width = "";
      el.style.maxWidth = "";
      el.style.marginBottom = "";
    });
}

function fitPrintSheets() {
  const sheets = document.querySelectorAll<HTMLElement>(
    ".bill-print-sheet, .lr-print-sheet, .lhc-memo-sheet, .lm-sheet",
  );
  if (!sheets.length) return;

  resetPrintSheets();

  const pageWidth = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
    1,
  );

  sheets.forEach((el) => {
    const need = Math.max(el.scrollWidth, el.offsetWidth);
    if (need <= pageWidth + 2) return;

    const scale = Math.min(1, pageWidth / need);
    if (scale >= 0.995) return;

    el.style.transformOrigin = "top left";
    el.style.transform = `scale(${scale})`;
    el.style.width = `${100 / scale}%`;
    // Collapse unused layout space under the scaled sheet
    el.style.marginBottom = `${el.offsetHeight * (scale - 1)}px`;
  });
}

let printHooksBound = false;

function bindPrintFitHooks() {
  if (printHooksBound || typeof window === "undefined") return;
  printHooksBound = true;
  window.addEventListener("beforeprint", fitPrintSheets);
  window.addEventListener("afterprint", resetPrintSheets);
}

/** Wait until print images are decoded, then open the browser print dialog. */
export function printWhenReady(delayMs = 200) {
  if (typeof window === "undefined") return;
  bindPrintFitHooks();

  const trigger = () => {
    fitPrintSheets();
    requestAnimationFrame(() => {
      setTimeout(() => {
        fitPrintSheets();
        window.print();
      }, delayMs);
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

  const ready = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0;

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

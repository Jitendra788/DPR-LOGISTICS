/** Wait for images, then open the browser print dialog. */
export function printWhenReady(delayMs = 120) {
  if (typeof window === "undefined") return;

  const trigger = () => {
    requestAnimationFrame(() => {
      setTimeout(() => window.print(), delayMs);
    });
  };

  const imgs = Array.from(document.images);
  if (!imgs.length || imgs.every((img) => img.complete)) {
    trigger();
    return;
  }

  Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
    ),
  ).finally(trigger);
}

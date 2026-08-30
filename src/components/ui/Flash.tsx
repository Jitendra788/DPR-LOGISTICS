"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, X } from "lucide-react";

type FlashMessage = { type: "ok" | "err"; text: string; at?: number } | null;

export function Flash({ message }: { message: FlashMessage }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState<FlashMessage>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      setCurrent(null);
      return;
    }
    setCurrent(message);
    setVisible(true);
    if (message.type !== "ok") return;
    const t = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(t);
  }, [message, message?.at, message?.text, message?.type]);

  if (!mounted || !current || !visible) return null;

  const ok = current.type === "ok";

  return createPortal(
    <div className="erp-flash-dock" role="status" aria-live="polite">
      <div className={`erp-flash-toast ${ok ? "is-ok" : "is-err"}`}>
        {ok ? <CheckCircle2 aria-hidden size={20} /> : <XCircle aria-hidden size={20} />}
        <p>{current.text}</p>
        <button type="button" className="erp-flash-close" aria-label="Dismiss" onClick={() => setVisible(false)}>
          <X aria-hidden size={16} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { company } from "@/data/marketing/company";

export function SiteChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mkt-chat">
      {open ? (
        <div className="mkt-chat-panel" role="dialog" aria-label="Customer support">
          <div className="mkt-chat-head">
            <strong>Customer Support</strong>
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)}>
              <X aria-hidden />
            </button>
          </div>
          <p>Hi! How can DPR Logistics help you today?</p>
          <div className="mkt-chat-actions">
            <Link href="/tracking">GC Tracking</Link>
            <Link href="/quote">Pickup Request</Link>
            <Link href="/contact/complaint">Service Complaint</Link>
            <Link href="/contact/care">Customer Care</Link>
          </div>
          <a className="mkt-chat-call" href={`tel:${company.supportPhone.replace(/\s/g, "")}`}>
            Call {company.supportPhone}
          </a>
        </div>
      ) : null}
      <button
        type="button"
        className="mkt-chat-btn"
        aria-label="Need help? Open support chat"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle aria-hidden />
        <span>Need Help?</span>
      </button>
    </div>
  );
}

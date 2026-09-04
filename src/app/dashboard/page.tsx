"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Truck,
  Users,
  Wrench,
  Car,
  UserPlus,
  PackageCheck,
  CircleDot,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ClientFormattedDate } from "@/components/ui/ClientFormattedDate";
import { DataTable } from "@/components/ui/DataTable";
import { BarChart, DonutChart } from "@/components/dashboard/Charts";
import { api } from "@/lib/api-client";

type Stats = {
  totalBookings: number;
  pendingLorryHire: number;
  pendingBill: number;
  customers: number;
};

type DashPayload = {
  stats: Stats;
  billedCount: number;
  unbilledCount: number;
  monthly: { label: string; value: number }[];
  vehicles: { total: number; available: number; onTrip: number; maint: number; pending: number };
  recent: {
    bookings: { k: string; v: string }[];
    bills: { k: string; v: string }[];
    payments: { k: string; v: string }[];
    pod: { k: string; v: string }[];
  };
};

type BookingRow = {
  id: number;
  lrNo: string;
  lrDate: string;
  fromStation?: string;
  toStation?: string;
  billingParty?: string;
  billed?: boolean;
  lhcNo?: string;
  vehNo?: string;
  grandTotal?: number;
};

type PartyRow = {
  id: number;
  name: string;
  contact?: string;
  gst?: string;
  partyType?: string;
  partyCode?: string;
};

type ListKey = "totalBookings" | "pendingLorryHire" | "pendingBill" | "customers";

const summaryCards: {
  key: ListKey;
  title: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  { key: "totalBookings", title: "Total Bookings", hint: "All LR bookings", href: "/booking/mis-report?all=1", icon: ClipboardList, tone: "teal" },
  { key: "pendingLorryHire", title: "Pending LHC", hint: "Awaiting lorry hire", href: "/lhc/contract", icon: Truck, tone: "slate" },
  { key: "pendingBill", title: "Pending Bill", hint: "Unbilled LRs", href: "/bills/weightwise", icon: FileText, tone: "amber" },
  { key: "customers", title: "Customers", hint: "Party master", href: "/master/party", icon: Users, tone: "navy" },
];

const quickActions = [
  { label: "New Booking", href: "/booking/lr", icon: ClipboardList },
  { label: "Lorry Hire", href: "/lhc/contract", icon: Truck },
  { label: "Create Bill", href: "/bills/weightwise", icon: FileText },
  { label: "Add Driver", href: "/master/drivers", icon: UserPlus },
  { label: "Self Vehicle", href: "/vehicle-register", icon: Car },
  { label: "POD Status", href: "/lhc/pod-status", icon: PackageCheck },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashPayload | null>(null);
  const [error, setError] = useState("");
  const [openList, setOpenList] = useState<ListKey | null>(null);
  const [listRows, setListRows] = useState<BookingRow[] | PartyRow[]>([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    let live = true;
    api<DashPayload>("/api/dashboard")
      .then((res) => {
        if (live) setData(res);
      })
      .catch((err) => {
        if (live) setError(err instanceof Error ? err.message : "Unable to load dashboard");
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!openList) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenList(null);
    }
    window.addEventListener("keydown", onKey);

    let live = true;
    setListLoading(true);
    setListRows([]);
    (async () => {
      try {
        if (openList === "customers") {
          const rows = await api<PartyRow[]>("/api/parties");
          if (live) setListRows(rows);
        } else {
          const rows = await api<BookingRow[]>("/api/bookings");
          const filtered =
            openList === "pendingLorryHire"
              ? rows.filter((b) => !b.lhcNo)
              : openList === "pendingBill"
                ? rows.filter((b) => !b.billed)
                : rows;
          if (live) setListRows(filtered);
        }
      } catch {
        if (live) setListRows([]);
      } finally {
        if (live) setListLoading(false);
      }
    })();

    return () => {
      live = false;
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openList]);

  const stats = data?.stats ?? null;
  const listMeta = openList ? summaryCards.find((c) => c.key === openList) : null;

  return (
    <div className="erp-dash">
      <header className="erp-dash-banner">
        <div className="erp-dash-banner-main">
          <p className="erp-dash-kicker">DPR Logistics</p>
          <h1 className="erp-dash-title">Operations Dashboard</h1>
          <p className="erp-dash-sub">
            <ClientFormattedDate />
            {stats ? ` · ${stats.totalBookings.toLocaleString("en-IN")} total bookings` : " · Loading…"}
          </p>
        </div>
        <div className="erp-dash-banner-actions">
          <Link href="/booking/lr" className="erp-dash-cta">
            New Booking
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/lhc/contract" className="erp-dash-cta erp-dash-cta-ghost">
            Lorry Hire
          </Link>
          <Link href="/bills/weightwise" className="erp-dash-cta erp-dash-cta-ghost">
            Create Bill
          </Link>
        </div>
      </header>

      {error ? (
        <div className="erp-alert" role="alert">
          {error}
        </div>
      ) : null}

      <section className="erp-kpi-grid" aria-label="Summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const value = stats ? stats[card.key] : null;
          return (
            <article key={card.key} className={`erp-kpi tone-${card.tone}`}>
              <button type="button" className="erp-kpi-hit" onClick={() => setOpenList(card.key)}>
                <span className="erp-kpi-icon" aria-hidden>
                  <Icon />
                </span>
                <span className="erp-kpi-body">
                  <span className="erp-kpi-title">{card.title}</span>
                  <span className="erp-kpi-value">
                    {value === null ? <span className="erp-skel" /> : value.toLocaleString("en-IN")}
                  </span>
                  <span className="erp-kpi-hint">{card.hint}</span>
                </span>
                <span className="erp-kpi-go" aria-hidden>
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </article>
          );
        })}
      </section>

      <section className="erp-panel erp-panel-actions" aria-label="Quick actions">
        <header className="erp-panel-h">
          <h2>Quick actions</h2>
        </header>
        <div className="erp-quick-grid">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.href} href={a.href} className="erp-quick">
                <span className="erp-quick-ico" aria-hidden>
                  <Icon className="h-4 w-4" />
                </span>
                {a.label}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="erp-mid">
        <section className="erp-panel">
          <header className="erp-panel-h">
            <h2>Bookings — last 6 months</h2>
            <button type="button" className="erp-text-btn" onClick={() => setOpenList("totalBookings")}>
              View all
            </button>
          </header>
          <BarChart data={data?.monthly ?? []} />
        </section>

        <section className="erp-panel">
          <header className="erp-panel-h">
            <h2>Bill status</h2>
            <button type="button" className="erp-text-btn" onClick={() => setOpenList("pendingBill")}>
              Pending list
            </button>
          </header>
          <DonutChart
            items={[
              { label: "Billed", value: data?.billedCount ?? 0, color: "#0f766e" },
              { label: "Pending", value: data?.unbilledCount ?? 0, color: "#d97706" },
            ]}
          />
        </section>
      </div>

      <div className="erp-bottom">
        <section className="erp-panel">
          <header className="erp-panel-h">
            <h2>Fleet snapshot</h2>
            <Link href="/master/vehicles">Manage</Link>
          </header>
          <div className="erp-vgrid">
            {[
              { label: "Total", value: data?.vehicles.total ?? 0, href: "/master/vehicles", icon: Car, tone: "navy" },
              { label: "Available", value: data?.vehicles.available ?? 0, href: "/master/vehicles", icon: CircleDot, tone: "teal" },
              { label: "On Trip", value: data?.vehicles.onTrip ?? 0, href: "/lhc/contract", icon: Truck, tone: "amber" },
              { label: "Service", value: data?.vehicles.maint ?? 0, href: "/vehicle-register/maintenance", icon: Wrench, tone: "slate" },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <Link key={row.label} href={row.href} className={`erp-vcard tone-${row.tone}`}>
                  <span className="erp-vcard-ico" aria-hidden>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="erp-panel">
          <header className="erp-panel-h">
            <h2>Recent activity</h2>
          </header>
          <div className="erp-activity">
            <ActivityCol title="Bookings" onOpen={() => setOpenList("totalBookings")} rows={data?.recent.bookings ?? []} empty="No bookings" />
            <ActivityCol title="Bills" href="/bills/search" rows={data?.recent.bills ?? []} empty="No bills" />
            <ActivityCol title="Payments" href="/bills/money-receipt" rows={data?.recent.payments ?? []} empty="No receipts" />
            <ActivityCol title="POD" href="/lhc/pod-status" rows={data?.recent.pod ?? []} empty="No POD yet" />
          </div>
        </section>
      </div>

      {openList && listMeta ? (
        <div className="erp-sheet" role="dialog" aria-modal="true" aria-labelledby="erp-sheet-title">
          <button type="button" className="erp-sheet-back" aria-label="Close list" onClick={() => setOpenList(null)} />
          <div className="erp-sheet-panel">
            <header className="erp-sheet-h">
              <div>
                <h2 id="erp-sheet-title">{listMeta.title}</h2>
                <p>{listMeta.hint}</p>
              </div>
              <div className="erp-sheet-actions">
                <Link href={listMeta.href} className="erp-sheet-open">
                  Open module <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button type="button" className="erp-icon-btn" aria-label="Close" onClick={() => setOpenList(null)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>
            <div className="erp-sheet-body">
              {listLoading ? (
                <p className="erp-empty">Loading…</p>
              ) : openList === "customers" ? (
                <DataTable
                  rows={listRows as PartyRow[]}
                  searchKeys={["name", "gst", "partyCode"]}
                  columns={[
                    { key: "id", header: "Sr" },
                    { key: "name", header: "Party Name" },
                    { key: "contact", header: "Contact" },
                    { key: "gst", header: "GST" },
                    { key: "partyType", header: "Type" },
                  ]}
                />
              ) : (
                <DataTable
                  rows={listRows as BookingRow[]}
                  searchKeys={["lrNo", "billingParty", "vehNo"]}
                  columns={[
                    { key: "lrNo", header: "LR No" },
                    { key: "lrDate", header: "Date" },
                    { key: "fromStation", header: "From" },
                    { key: "toStation", header: "To" },
                    { key: "vehNo", header: "Vehicle" },
                    { key: "billingParty", header: "Party" },
                    { key: "grandTotal", header: "Amount" },
                    {
                      key: "billed",
                      header: "Billed",
                      render: (row) => (row.billed ? "Yes" : "No"),
                    },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActivityCol({
  title,
  href,
  onOpen,
  rows,
  empty,
}: {
  title: string;
  href?: string;
  onOpen?: () => void;
  rows: { k: string; v: string }[];
  empty: string;
}) {
  return (
    <div>
      <div className="erp-act-h">
        <h3>{title}</h3>
        {onOpen ? (
          <button type="button" className="erp-text-btn" onClick={onOpen}>
            All
          </button>
        ) : href ? (
          <Link href={href}>All</Link>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="erp-empty">{empty}</p>
      ) : (
        <ul className="erp-act-list">
          {rows.map((r) => (
            <li key={`${title}-${r.k}`}>
              <strong>{r.k}</strong>
              <span>{r.v}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

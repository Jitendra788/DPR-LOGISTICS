"use client";

import { useEffect, useMemo, useState } from "react";
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
import { PageHeader } from "@/components/ui/PageHeader";
import { ClientFormattedDate } from "@/components/ui/ClientFormattedDate";
import { DataTable } from "@/components/ui/DataTable";
import { BarChart, DonutChart, SparkLine } from "@/components/dashboard/Charts";
import { api } from "@/lib/api-client";
import { lastSixMonths, monthKey, parseLooseDate } from "@/lib/chart-dates";

type Stats = {
  totalBookings: number;
  pendingLorryHire: number;
  pendingBill: number;
  customers: number;
};

type Booking = {
  id: number;
  lrNo: string;
  lrDate: string;
  fromStation?: string;
  toStation?: string;
  billingParty?: string;
  billed?: boolean;
  lhcNo?: string;
  podStatus?: string;
  vehNo?: string;
  freight?: number;
  grandTotal?: number;
  createdAt?: string;
};

type Party = { id: number; name: string; contact?: string; gst?: string; partyType?: string; partyCode?: string };
type Bill = { id: number; billNo: string; partyName: string; amount: number; billDate: string };
type Vehicle = { id: number; vehNo: string };
type Fleet = { id: number; vehNo: string; status?: string };
type Maintenance = { id: number; vehNo: string };
type Lhc = { id: number; challanNo: string; vehNo: string; paid?: boolean; challanDate: string };
type Receipt = { id: number; receiptNo: string; partyName: string; amount: number; date: string };

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
  { key: "pendingLorryHire", title: "Pending Lorry Hire", hint: "Awaiting LHC", href: "/lhc/contract", icon: Truck, tone: "slate" },
  { key: "pendingBill", title: "Pending Bill", hint: "Unbilled LRs", href: "/bills/generation", icon: FileText, tone: "amber" },
  { key: "customers", title: "Customers", hint: "Party master", href: "/master/party", icon: Users, tone: "navy" },
];

const quickActions = [
  { label: "New Booking", href: "/booking/lr", icon: ClipboardList },
  { label: "Lorry Hire", href: "/lhc/contract", icon: Truck },
  { label: "Create Bill", href: "/bills/weightwise", icon: FileText },
  { label: "Add Driver", href: "/master/drivers", icon: UserPlus },
  { label: "Vehicle Register", href: "/vehicle-register", icon: Car },
  { label: "POD Status", href: "/lhc/pod-status", icon: PackageCheck },
];

function safeList<T>(p: Promise<T[]>): Promise<T[]> {
  return p.catch(() => [] as T[]);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fleet, setFleet] = useState<Fleet[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [lhc, setLhc] = useState<Lhc[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [openList, setOpenList] = useState<ListKey | null>(null);

  useEffect(() => {
    let live = true;
    api<Stats>("/api/dashboard")
      .then((data) => {
        if (live) setStats(data);
      })
      .catch((err) => {
        if (live) setError(err instanceof Error ? err.message : "Unable to load dashboard");
      });

    Promise.all([
      safeList(api<Booking[]>("/api/bookings")),
      safeList(api<Party[]>("/api/parties")),
      safeList(api<Bill[]>("/api/bills")),
      safeList(api<Vehicle[]>("/api/vehicles")),
      safeList(api<Fleet[]>("/api/fleet")),
      safeList(api<Maintenance[]>("/api/maintenance")),
      safeList(api<Lhc[]>("/api/lhc")),
      safeList(api<Receipt[]>("/api/receipts")),
    ]).then(([bk, pt, bl, vh, fl, mt, lh, rc]) => {
      if (!live) return;
      setBookings(bk);
      setParties(pt);
      setBills(bl);
      setVehicles(vh);
      setFleet(fl);
      setMaintenance(mt);
      setLhc(lh);
      setReceipts(rc);
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
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openList]);

  const monthly = useMemo(() => {
    const months = lastSixMonths();
    return months.map((m) => ({
      label: m.label,
      value: bookings.filter((b) => {
        const d = parseLooseDate(b.lrDate) ?? (b.createdAt ? new Date(b.createdAt) : null);
        return d ? monthKey(d) === m.key : false;
      }).length,
    }));
  }, [bookings]);

  const billedCount = bookings.filter((b) => b.billed).length;
  const unbilledCount = bookings.filter((b) => !b.billed).length;
  const pendingHireRows = bookings.filter((b) => !b.lhcNo);
  const pendingBillRows = bookings.filter((b) => !b.billed);

  const vehicleStatus = useMemo(() => {
    const total = vehicles.length;
    const maintSet = new Set(maintenance.map((m) => m.vehNo).filter(Boolean));
    const onTripSet = new Set(lhc.filter((row) => !row.paid).map((row) => row.vehNo).filter(Boolean));
    const fleetAvail = fleet.filter((f) => (f.status || "Available").toLowerCase() === "available").length;
    const onTrip = onTripSet.size;
    const maint = [...maintSet].filter((v) => !onTripSet.has(v)).length;
    const available = fleet.length ? fleetAvail : Math.max(0, total - onTrip - maint);
    const pending = Math.max(0, total - available - onTrip - maint);
    return { total, available, onTrip, maint, pending };
  }, [vehicles, fleet, maintenance, lhc]);

  const listMeta = openList ? summaryCards.find((c) => c.key === openList) : null;

  return (
    <div className="erp-dash">
      <PageHeader
        title="Dashboard"
        subtitle="Operations overview"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Dashboard" }]}
      />

      <div className="erp-hero">
        <div>
          <p className="erp-hero-kicker">DPR Logistics</p>
          <h2>Control panel</h2>
          <p>Click a card to open its live list. Numbers come from your current records.</p>
        </div>
        <div className="erp-hero-pills">
          <ClientFormattedDate />
          <span>{stats ? `${stats.totalBookings} bookings` : "Loading…"}</span>
        </div>
      </div>

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
                <span className="erp-kpi-icon">
                  <Icon />
                </span>
                <span className="erp-kpi-body">
                  <span className="erp-kpi-title">{card.title}</span>
                  <span className="erp-kpi-value">
                    {value === null ? <span className="erp-skel" /> : value.toLocaleString("en-IN")}
                  </span>
                  <span className="erp-kpi-hint">{card.hint}</span>
                  <span className="erp-kpi-link">
                    Show List <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </button>
            </article>
          );
        })}
      </section>

      <section className="erp-panel">
        <header className="erp-panel-h">
          <h2>Quick Actions</h2>
        </header>
        <div className="erp-quick-grid">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.href} href={a.href} className="erp-quick">
                <Icon className="h-4 w-4" />
                {a.label}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="erp-mid">
        <section className="erp-panel">
          <header className="erp-panel-h">
            <h2>Booking Overview</h2>
            <button type="button" className="erp-text-btn" onClick={() => setOpenList("totalBookings")}>
              View list
            </button>
          </header>
          <BarChart data={monthly} />
        </section>

        <section className="erp-panel">
          <header className="erp-panel-h">
            <h2>Pending Bills</h2>
            <button type="button" className="erp-text-btn" onClick={() => setOpenList("pendingBill")}>
              View list
            </button>
          </header>
          <DonutChart
            items={[
              { label: "Billed", value: billedCount, color: "#0f766e" },
              { label: "Pending", value: unbilledCount, color: "#b45309" },
            ]}
          />
        </section>

        <section className="erp-panel">
          <header className="erp-panel-h">
            <h2>Monthly Booking Trend</h2>
          </header>
          <SparkLine values={monthly.map((m) => m.value)} />
          <div className="erp-spark-labels">
            {monthly.map((m) => (
              <span key={m.label}>{m.label}</span>
            ))}
          </div>
        </section>
      </div>

      <div className="erp-bottom">
        <section className="erp-panel">
          <header className="erp-panel-h">
            <h2>Vehicle Status</h2>
            <Link href="/master/vehicles">Show Vehicle Status</Link>
          </header>
          <div className="erp-vgrid">
            {[
              { label: "Total Vehicles", value: vehicleStatus.total, href: "/master/vehicles", icon: Car },
              { label: "Available", value: vehicleStatus.available, href: "/master/vehicles", icon: CircleDot },
              { label: "On Trip", value: vehicleStatus.onTrip, href: "/lhc/contract", icon: Truck },
              { label: "Maintenance", value: vehicleStatus.maint, href: "/vehicle-register/maintenance", icon: Wrench },
              { label: "Pending", value: vehicleStatus.pending, href: "/lhc/contract", icon: FileText },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <Link key={row.label} href={row.href} className="erp-vcard">
                  <Icon className="h-4 w-4" />
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="erp-panel">
          <header className="erp-panel-h">
            <h2>Recent Activity</h2>
          </header>
          <div className="erp-activity">
            <ActivityCol title="Bookings" onOpen={() => setOpenList("totalBookings")} rows={bookings.slice(0, 5).map((b) => ({ k: b.lrNo, v: b.billingParty || b.lrDate }))} empty="No bookings yet" />
            <ActivityCol title="Bills" href="/bills/search" rows={bills.slice(0, 5).map((b) => ({ k: b.billNo, v: b.partyName }))} empty="No bills yet" />
            <ActivityCol title="Payments" href="/bills/money-receipt" rows={receipts.slice(0, 5).map((r) => ({ k: r.receiptNo || `#${r.id}`, v: r.partyName }))} empty="No receipts yet" />
            <ActivityCol title="POD updates" href="/lhc/pod-status" rows={bookings.filter((b) => (b.podStatus || "").toLowerCase() === "received").slice(0, 5).map((b) => ({ k: b.lrNo, v: b.podStatus || "Received" }))} empty="No POD received yet" />
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
                  Open module
                </Link>
                <button type="button" className="erp-icon-btn" aria-label="Close" onClick={() => setOpenList(null)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>
            <div className="erp-sheet-body">
              {openList === "customers" ? (
                <DataTable
                  rows={parties}
                  searchKeys={["name", "gst", "partyCode"]}
                  columns={[
                    { key: "id", header: "Sr" },
                    { key: "name", header: "Party Name" },
                    { key: "contact", header: "Contact" },
                    { key: "gst", header: "GST" },
                    { key: "partyType", header: "Type" },
                    { key: "partyCode", header: "Code" },
                  ]}
                />
              ) : (
                <DataTable
                  rows={openList === "pendingLorryHire" ? pendingHireRows : openList === "pendingBill" ? pendingBillRows : bookings}
                  searchKeys={["lrNo", "billingParty", "vehNo"]}
                  columns={[
                    { key: "lrNo", header: "LR No" },
                    { key: "lrDate", header: "Date" },
                    { key: "fromStation", header: "From" },
                    { key: "toStation", header: "To" },
                    { key: "vehNo", header: "Vehicle" },
                    { key: "billingParty", header: "Party" },
                    { key: "grandTotal", header: "Amount" },
                    { key: "lhcNo", header: "LHC" },
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
            <li key={r.k}>
              <strong>{r.k}</strong>
              <span>{r.v}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

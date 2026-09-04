/**
 * Smoke-test critical ERP APIs (login + CRUD + bill/outstanding/delete cascade).
 * Run: node scripts/api-smoke.mjs
 */
const BASE = process.env.SMOKE_BASE || "http://localhost:3000";

let cookie = "";

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
      ...(opts.headers || {}),
    },
  });
  const set = res.headers.getSetCookie?.() || [];
  for (const c of set) {
    const part = c.split(";")[0];
    if (part.startsWith("dpr_session=")) cookie = part;
  }
  // Node < fetch getSetCookie fallback
  const raw = res.headers.get("set-cookie");
  if (raw && raw.includes("dpr_session=")) {
    cookie = raw.split(",").map((s) => s.trim()).find((s) => s.startsWith("dpr_session="))?.split(";")[0] || cookie;
    if (!cookie && raw.includes("dpr_session=")) {
      const m = raw.match(/dpr_session=[^;]+/);
      if (m) cookie = m[0];
    }
  }
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, ok: res.ok, body, text };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const results = [];
function pass(name) {
  results.push({ name, ok: true });
  console.log(`  OK  ${name}`);
}
function fail(name, err) {
  results.push({ name, ok: false, err: String(err) });
  console.log(`  FAIL ${name}: ${err}`);
}

async function check(name, fn) {
  try {
    await fn();
    pass(name);
  } catch (e) {
    fail(name, e.message || e);
  }
}

const RESOURCES = [
  "parties",
  "users",
  "drivers",
  "vehicles",
  "vendors",
  "stations",
  "rates",
  "bookings",
  "lhc",
  "bills",
  "driver-register",
  "driver-advance",
  "trips",
  "expenses",
  "fleet",
  "maintenance",
  "receipts",
  "vendor-vouchers",
  "driver-vouchers",
  "slips",
  "tyres",
  "trip-desk",
];

async function main() {
  console.log(`Smoke testing ${BASE}\n`);

  await check("public/db-status", async () => {
    const r = await req("/api/public/db-status");
    assert(r.status === 200, `status ${r.status}`);
    assert(r.body?.configured === true, "db not configured");
  });

  await check("auth/login", async () => {
    const r = await req("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "admin123" }),
    });
    assert(r.status === 200, `status ${r.status} ${JSON.stringify(r.body)}`);
    assert(cookie.includes("dpr_session"), "no session cookie");
  });

  await check("auth/me", async () => {
    const r = await req("/api/auth/me");
    assert(r.status === 200, `status ${r.status}`);
  });

  for (const resource of RESOURCES) {
    await check(`GET /api/${resource}`, async () => {
      const r = await req(`/api/${resource}`);
      assert(r.status === 200, `status ${r.status} ${JSON.stringify(r.body)?.slice(0, 120)}`);
      assert(Array.isArray(r.body), "expected array");
    });
  }

  const nextTypes = ["lr", "bill", "lhc", "party", "vehicle", "slip", "fleet", "driver", "receipt", "vendor-voucher", "driver-voucher"];
  for (const type of nextTypes) {
    await check(`next-no?type=${type}`, async () => {
      const r = await req(`/api/next-no?type=${type}&source=DPR`);
      assert(r.status === 200, `status ${r.status} ${JSON.stringify(r.body)}`);
      assert(r.body && (r.body.value != null || r.body.sr != null || r.body.receiptNo != null || r.body.partyCode != null), "empty next-no");
    });
  }

  await check("next-no bill ROADWAYS", async () => {
    const r = await req("/api/next-no?type=bill&source=ROADWAYS");
    assert(r.status === 200, `status ${r.status}`);
    assert(String(r.body.value || "").startsWith("RW-") || r.body.value, `unexpected ${JSON.stringify(r.body)}`);
  });

  await check("reports/money-receipt-outstanding DPR", async () => {
    const r = await req("/api/reports/money-receipt-outstanding?source=DPR");
    assert(r.status === 200, `status ${r.status} ${JSON.stringify(r.body)?.slice(0, 200)}`);
    assert(Array.isArray(r.body), "expected array");
    for (const row of r.body) {
      assert(typeof row.outstanding === "number", "missing outstanding");
      assert(row.outstanding > 0, "should filter zero outstanding");
      assert(row.billAmount > 0, "billAmount should be > 0");
      // Bill amount should be >= beforeTax (GST on top)
      assert(row.billAmount + 0.01 >= row.beforeTax, `billAmount ${row.billAmount} < beforeTax ${row.beforeTax} for ${row.billNo}`);
    }
  });

  await check("reports/money-receipt-outstanding ROADWAYS", async () => {
    const r = await req("/api/reports/money-receipt-outstanding?source=ROADWAYS");
    assert(r.status === 200, `status ${r.status}`);
    assert(Array.isArray(r.body), "expected array");
  });

  await check("reports/bookings", async () => {
    const r = await req("/api/reports/bookings");
    assert(r.status === 200, `status ${r.status}`);
  });

  await check("reports/gst-summary", async () => {
    const r = await req("/api/reports/gst-summary?source=DPR");
    assert(r.status === 200, `status ${r.status} ${JSON.stringify(r.body)?.slice(0, 200)}`);
  });

  await check("dashboard", async () => {
    const r = await req("/api/dashboard");
    assert(r.status === 200, `status ${r.status}`);
  });

  await check("search", async () => {
    const r = await req("/api/search?q=a");
    assert(r.status === 200, `status ${r.status}`);
  });

  // Full flow: create LR → generate bill → outstanding shows → delete bill → outstanding gone + LR unbilled
  let lrId = null;
  let billNo = null;
  const stamp = Date.now().toString().slice(-6);

  await check("flow: create TBB LR", async () => {
    const next = await req("/api/next-no?type=lr&source=DPR");
    assert(next.ok, JSON.stringify(next.body));
    const lrNo = `SMK-${stamp}`;
    const r = await req("/api/bookings", {
      method: "POST",
      body: JSON.stringify({
        lrNo,
        lrDate: "2026-09-04",
        fromStation: "PUNE",
        toStation: "MUMBAI",
        billingParty: "Smoke Test Party",
        consignor: "Smoke Test Party",
        consignee: "Smoke Consignee",
        freight: 1000,
        total: 1000,
        gst: 0,
        grandTotal: 1000,
        lrType: "TBB",
        billAs: "Weight",
        source: "DPR",
        billed: false,
        billNo: "",
      }),
    });
    assert(r.status === 200 || r.status === 201, `create LR ${r.status} ${JSON.stringify(r.body)}`);
    lrId = r.body.id;
    assert(lrId, "no lr id");
  });

  await check("flow: generate bill", async () => {
    const next = await req("/api/next-no?type=bill&source=DPR");
    billNo = `SMK-B-${stamp}`;
    // Prefer unique smoke bill no; if collide generate uses unique retry
    const r = await req("/api/bills/generate", {
      method: "POST",
      body: JSON.stringify({
        partyName: "Smoke Test Party",
        source: "DPR",
        lrIds: [lrId],
        billNo,
        billDate: "2026-09-04",
        amount: 1000,
        cgstPct: 9,
        sgstPct: 9,
        igstPct: 0,
      }),
    });
    assert(r.status === 200, `generate ${r.status} ${JSON.stringify(r.body)}`);
    billNo = r.body.bill?.billNo || billNo;
    assert(billNo, "no billNo");
    assert(r.body.lrCount === 1, "lrCount");
  });

  await check("flow: outstanding includes new bill", async () => {
    const r = await req(`/api/reports/money-receipt-outstanding?source=DPR&billNo=${encodeURIComponent(billNo)}`);
    assert(r.status === 200, JSON.stringify(r.body));
    assert(r.body.length === 1, `expected 1 row got ${r.body.length}`);
    const row = r.body[0];
    // 1000 + 9% + 9% = 1180
    assert(Math.abs(row.billAmount - 1180) < 0.05, `billAmount ${row.billAmount} expected ~1180`);
    assert(Math.abs(row.outstanding - 1180) < 0.05, `outstanding ${row.outstanding}`);
  });

  await check("flow: delete bill cascades", async () => {
    const bills = await req("/api/bills");
    const bill = bills.body.find((b) => b.billNo === billNo);
    assert(bill, "bill not found before delete");
    const r = await req(`/api/bills/${bill.id}?billNo=${encodeURIComponent(billNo)}`, { method: "DELETE" });
    assert(r.status === 200, `delete ${r.status} ${JSON.stringify(r.body)}`);

    const out = await req(`/api/reports/money-receipt-outstanding?source=DPR&billNo=${encodeURIComponent(billNo)}`);
    assert(out.body.length === 0, "deleted bill still in outstanding");

    const lr = await req(`/api/bookings/${lrId}`);
    assert(lr.status === 200, "lr missing");
    assert(!lr.body.billed && !lr.body.billNo, `LR still billed: ${JSON.stringify(lr.body)}`);
  });

  await check("flow: delete LR", async () => {
    const r = await req(`/api/bookings/${lrId}`, { method: "DELETE" });
    assert(r.status === 200, `delete LR ${r.status} ${JSON.stringify(r.body)}`);
    const gone = await req(`/api/bookings/${lrId}`);
    assert(gone.status === 404 || gone.body?.error, "LR still exists");
  });

  // Bill + LR delete cascade when last LR deleted
  let lr2 = null;
  let bill2 = null;
  await check("flow2: LR delete removes empty bill from outstanding", async () => {
    const create = await req("/api/bookings", {
      method: "POST",
      body: JSON.stringify({
        lrNo: `SMK2-${stamp}`,
        lrDate: "2026-09-04",
        billingParty: "Smoke Test Party",
        freight: 500,
        total: 500,
        grandTotal: 500,
        lrType: "TBB",
        billAs: "Weight",
        source: "DPR",
      }),
    });
    assert(create.ok, JSON.stringify(create.body));
    lr2 = create.body.id;
    const gen = await req("/api/bills/generate", {
      method: "POST",
      body: JSON.stringify({
        partyName: "Smoke Test Party",
        source: "DPR",
        lrIds: [lr2],
        billNo: `SMK2-B-${stamp}`,
        billDate: "2026-09-04",
        amount: 500,
        cgstPct: 0,
        sgstPct: 0,
        igstPct: 0,
      }),
    });
    assert(gen.ok, JSON.stringify(gen.body));
    bill2 = gen.body.bill.billNo;

    const del = await req(`/api/bookings/${lr2}`, { method: "DELETE" });
    assert(del.ok, JSON.stringify(del.body));

    const out = await req(`/api/reports/money-receipt-outstanding?source=DPR&billNo=${encodeURIComponent(bill2)}`);
    assert(out.body.length === 0, "bill still outstanding after last LR delete");

    const bills = await req("/api/bills");
    assert(!bills.body.some((b) => b.billNo === bill2), "orphan bill still exists");
  });

  // Party / fleet / fleet CRUD roundtrip
  let partyId = null;
  await check("CRUD party create/update/delete", async () => {
    const name = `Smoke Party ${stamp}`;
    const c = await req("/api/parties", {
      method: "POST",
      body: JSON.stringify({ name, address: "Test", contact: "9999999999", partyType: "Customer" }),
    });
    assert(c.ok, JSON.stringify(c.body));
    partyId = c.body.id;
    const u = await req(`/api/parties/${partyId}`, {
      method: "PUT",
      body: JSON.stringify({ name, address: "Updated", contact: "9999999999", partyType: "Customer" }),
    });
    assert(u.ok, JSON.stringify(u.body));
    assert(u.body.address === "Updated", "update not applied");
    const d = await req(`/api/parties/${partyId}`, { method: "DELETE" });
    assert(d.ok, JSON.stringify(d.body));
  });

  let fleetId = null;
  await check("CRUD fleet create/delete", async () => {
    const vehNo = `SMK${stamp}`;
    const c = await req("/api/fleet", {
      method: "POST",
      body: JSON.stringify({
        vehNo,
        opKm: "1000",
        tyreChangeKmAfter: "50000",
        servicingAfter: "10000",
        olKm: "1000",
      }),
    });
    assert(c.ok, JSON.stringify(c.body));
    fleetId = c.body.id;
    const list = await req("/api/fleet");
    const found = list.body.find((v) => v.vehNo === vehNo);
    assert(found?.opKm === "1000", "fleet fields not saved");
    const d = await req(`/api/fleet/${fleetId}`, { method: "DELETE" });
    assert(d.ok, JSON.stringify(d.body));
  });

  console.log("\n—— Summary ——");
  const failed = results.filter((r) => !r.ok);
  console.log(`Passed: ${results.length - failed.length}/${results.length}`);
  if (failed.length) {
    console.log("Failures:");
    for (const f of failed) console.log(` - ${f.name}: ${f.err}`);
    process.exit(1);
  }
  console.log("All API smoke checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

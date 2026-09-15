import { type NavItem } from "@/lib/nav";

function isAdminRole(role?: string | null) {
  return String(role || "").toLowerCase() === "admin";
}

/** Assignable sidebar modules (User Creation checkboxes). User Creation is Admin-only — not listed. */
export const APP_MODULES = [
  { key: "dashboard", label: "Dashboard", group: "" },
  { key: "master-party", label: "Party Creation", group: "Master Data" },
  { key: "master-drivers", label: "Driver / Staff A/C", group: "Master Data" },
  { key: "master-vehicles", label: "Vehicle Creation", group: "Master Data" },
  { key: "master-vendors", label: "Vendor Creation", group: "Master Data" },
  { key: "booking", label: "Booking", group: "" },
  { key: "lhc", label: "LHC", group: "" },
  { key: "bills", label: "Bill Preparation", group: "" },
  { key: "other", label: "Other Data Entrys", group: "" },
  { key: "driver", label: "Driver Data", group: "" },
  { key: "roadways", label: "DPR Roadways Module", group: "" },
  { key: "vehicle-register", label: "Self Vehicle Register", group: "" },
  { key: "trip-desk", label: "Trip Desk", group: "" },
  { key: "tracking-desk", label: "Tracking Desk", group: "" },
  { key: "website", label: "Website Content", group: "" },
] as const;

export type ModuleKey = (typeof APP_MODULES)[number]["key"];

export const ALL_MODULE_KEYS: ModuleKey[] = APP_MODULES.map((m) => m.key);

const MASTER_PAGE_KEYS: ModuleKey[] = [
  "master-party",
  "master-drivers",
  "master-vehicles",
  "master-vendors",
];

/** Expand legacy "master" / unknown keys into current module keys. */
function expandLegacyKeys(keys: string[]): ModuleKey[] {
  const out = new Set<ModuleKey>();
  for (const raw of keys) {
    const k = String(raw);
    if (k === "master") {
      for (const m of MASTER_PAGE_KEYS) out.add(m);
      continue;
    }
    if (ALL_MODULE_KEYS.includes(k as ModuleKey)) out.add(k as ModuleKey);
  }
  return ALL_MODULE_KEYS.filter((k) => out.has(k));
}

const LABEL_TO_MODULE: Record<string, ModuleKey | "master-users"> = {
  Dashboard: "dashboard",
  "Master Data": "master-party", // parent handled separately
  Booking: "booking",
  LHC: "lhc",
  "Bill Prepration": "bills",
  "Other Data Entrys": "other",
  "Driver Data": "driver",
  "DPR Roadways Module": "roadways",
  "Self Vehicle Register": "vehicle-register",
  "Trip Desk": "trip-desk",
  "Tracking Desk": "tracking-desk",
  "Website Content": "website",
};

const CHILD_HREF_MODULE: Record<string, ModuleKey | "master-users" | "master-backup"> = {
  "/master/party": "master-party",
  "/master/users": "master-users",
  "/master/backup": "master-backup",
  "/master/drivers": "master-drivers",
  "/master/vehicles": "master-vehicles",
  "/master/vendors": "master-vendors",
};

/** Path prefix → module (first match wins; more specific first). */
const PATH_MODULE_RULES: Array<{ prefix: string; module: ModuleKey | "master-users" | "master-backup" }> = [
  { prefix: "/master/users", module: "master-users" },
  { prefix: "/master/backup", module: "master-backup" },
  { prefix: "/master/party", module: "master-party" },
  { prefix: "/master/drivers", module: "master-drivers" },
  { prefix: "/master/vehicles", module: "master-vehicles" },
  { prefix: "/master/vendors", module: "master-vendors" },
  { prefix: "/master", module: "master-party" },
  { prefix: "/booking", module: "booking" },
  { prefix: "/lhc", module: "lhc" },
  { prefix: "/bills", module: "bills" },
  { prefix: "/other", module: "other" },
  { prefix: "/driver-data", module: "driver" },
  { prefix: "/roadways", module: "roadways" },
  { prefix: "/vehicle-register", module: "vehicle-register" },
  { prefix: "/trip-desk", module: "trip-desk" },
  { prefix: "/tracking-desk", module: "tracking-desk" },
  { prefix: "/website", module: "website" },
  { prefix: "/dashboard", module: "dashboard" },
];

export function parseAllowedModules(raw?: string | null): ModuleKey[] | "*" {
  const text = String(raw ?? "").trim();
  if (!text || text === "*") return "*";
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return "*";
    const keys = expandLegacyKeys(parsed.map(String));
    return keys;
  } catch {
    const keys = expandLegacyKeys(text.split(",").map((s) => s.trim()));
    return keys.length ? keys : "*";
  }
}

export function serializeAllowedModules(modules: ModuleKey[] | "*"): string {
  if (modules === "*") return "*";
  const unique = ALL_MODULE_KEYS.filter((k) => modules.includes(k));
  return JSON.stringify(unique);
}

/** Effective access: Admin / legacy empty = all. */
export function resolveModules(role: string | null | undefined, raw?: string | null): ModuleKey[] | "*" {
  if (isAdminRole(role)) return "*";
  return parseAllowedModules(raw);
}

export function hasModule(modules: ModuleKey[] | "*", key: ModuleKey) {
  return modules === "*" || modules.includes(key);
}

export function moduleForPath(pathname: string): ModuleKey | "master-users" | "master-backup" | null {
  const path = pathname.split("?")[0] || pathname;
  for (const rule of PATH_MODULE_RULES) {
    if (path === rule.prefix || path.startsWith(`${rule.prefix}/`)) return rule.module;
  }
  return null;
}

export function canAccessPath(
  pathname: string,
  modules: ModuleKey[] | "*",
  role?: string | null,
) {
  const path = pathname.split("?")[0] || pathname;
  // User Creation + Data Backup — Admin only
  if (
    path === "/master/users" ||
    path.startsWith("/master/users/") ||
    path === "/master/backup" ||
    path.startsWith("/master/backup/") ||
    path.startsWith("/api/admin/")
  ) {
    return isAdminRole(role);
  }
  if (modules === "*") return true;
  const mod = moduleForPath(path);
  if (!mod || mod === "master-users" || mod === "master-backup") return true;
  if (mod === "master-drivers" && modules.includes("driver")) return true;
  return modules.includes(mod);
}

function childAllowed(
  href: string,
  modules: ModuleKey[] | "*",
  role?: string | null,
): boolean {
  const key = CHILD_HREF_MODULE[href];
  if (key === "master-users" || key === "master-backup") return isAdminRole(role);
  if (modules === "*") return true;
  if (!key) return true;
  if (key === "master-drivers" && modules.includes("driver")) return true;
  return modules.includes(key);
}

export function filterNavByModules(
  items: NavItem[],
  modules: ModuleKey[] | "*",
  role?: string | null,
): NavItem[] {
  return items
    .map((item) => {
      if (item.label === "Master Data" && item.children) {
        const children = item.children.filter((c) => childAllowed(c.href, modules, role));
        if (!children.length) return null;
        return { ...item, children };
      }
      if (modules === "*") return item;
      const key = LABEL_TO_MODULE[item.label];
      if (!key || key === "master-users") return item;
      // Parent Master Data already handled
      if (item.label === "Master Data") return item;
      if (!modules.includes(key as ModuleKey)) return null;
      return item;
    })
    .filter(Boolean) as NavItem[];
}

const MODULE_HOME: Record<ModuleKey, string> = {
  dashboard: "/dashboard",
  "master-party": "/master/party",
  "master-drivers": "/master/drivers",
  "master-vehicles": "/master/vehicles",
  "master-vendors": "/master/vendors",
  booking: "/booking/lr",
  lhc: "/lhc/contract",
  bills: "/bills/search",
  other: "/other/vendor-voucher",
  driver: "/driver-data/voucher",
  roadways: "/roadways/booking-slip",
  "vehicle-register": "/vehicle-register",
  "trip-desk": "/trip-desk",
  "tracking-desk": "/tracking-desk",
  website: "/website/blog",
};

/** First allowed module home (used after login / denied redirect). */
export function homePathForModules(modules: ModuleKey[] | "*", role?: string | null): string {
  if (modules === "*" || isAdminRole(role)) return MODULE_HOME.dashboard;
  for (const key of ALL_MODULE_KEYS) {
    if (modules.includes(key)) return MODULE_HOME[key];
  }
  return MODULE_HOME.dashboard;
}

export function navModuleKey(item: NavItem): ModuleKey | null {
  const key = LABEL_TO_MODULE[item.label];
  if (!key || key === "master-users") return null;
  return key as ModuleKey;
}

export function normalizeModulesInput(value: unknown): string {
  if (value === "*" || value === "all") return "*";
  if (Array.isArray(value)) {
    return serializeAllowedModules(expandLegacyKeys(value.map(String)));
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (!text || text === "*") return "*";
    try {
      const parsed = JSON.parse(text) as unknown;
      if (Array.isArray(parsed)) return normalizeModulesInput(parsed);
    } catch {
      /* comma list */
    }
    const parsed = parseAllowedModules(text);
    return parsed === "*" ? "*" : serializeAllowedModules(parsed);
  }
  return "[]";
}

/** Compact session payload: * or comma keys. */
export function modulesToSession(modules: ModuleKey[] | "*"): string {
  return modules === "*" ? "*" : modules.join(",");
}

export function modulesFromSession(raw?: string | null): ModuleKey[] | "*" {
  const text = String(raw ?? "").trim();
  if (!text || text === "*") return "*";
  const keys = expandLegacyKeys(text.split(",").map((s) => s.trim()));
  return keys.length ? keys : "*";
}

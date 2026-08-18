"use client";

import Link from "next/link";
import { ADMIN_HOME } from "@/lib/admin-routes";
import { BrandLogo } from "@/components/BrandLogo";
import { usePathname } from "next/navigation";
import {
  Car,
  ChevronDown,
  CircleUser,
  ClipboardList,
  Database,
  FileText,
  FolderPlus,
  LayoutDashboard,
  Truck,
  UserRound,
  Warehouse,
  X,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { navItems, type NavItem } from "@/lib/nav";

const icons: Record<string, ComponentType<{ className?: string }>> = {
  gauge: LayoutDashboard,
  monitor: Database,
  clipboard: ClipboardList,
  grid: Warehouse,
  file: FileText,
  "plus-square": FolderPlus,
  user: UserRound,
  truck: Truck,
  car: Car,
};

function isActive(pathname: string, item: NavItem) {
  if (item.href) return pathname === item.href;
  return item.children?.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`)) ?? false;
}

type Props = {
  open: boolean;
  collapsed: boolean;
  isDesktop: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ open, collapsed, isDesktop, onNavigate }: Props) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string>("");

  useEffect(() => {
    const match = navItems.find((item) => isActive(pathname, item));
    if (match?.children && !collapsed) setExpanded(match.label);
  }, [pathname, collapsed]);

  return (
    <aside
      className={`erp-sidebar ${open ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`}
      aria-hidden={!open}
      aria-label="Main navigation"
    >
      <div className="erp-sidebar-brand">
        <Link href={ADMIN_HOME} className="erp-brand-link" onClick={onNavigate} title="DPR Logistics">
          <BrandLogo width={collapsed ? 36 : 140} height={collapsed ? 36 : 56} className={`erp-brand-logo ${collapsed ? "erp-brand-logo-collapsed" : ""}`} />
          {!collapsed ? (
            <span className="erp-brand-text">
              <strong>DPR Logistics</strong>
              <small>Operations Console</small>
            </span>
          ) : null}
        </Link>
        {!isDesktop && open ? (
          <button type="button" className="erp-icon-btn" aria-label="Close menu" onClick={onNavigate}>
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="erp-sidebar-user">
          <div className="erp-avatar" aria-hidden>
            <CircleUser className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="erp-sidebar-user-name">Admin User</p>
            <p className="erp-sidebar-user-role">Operations</p>
          </div>
        </div>
      ) : null}

      <nav className="sidebar-scroll erp-nav">
        {navItems.map((item) => {
          const Icon = icons[item.icon] ?? LayoutDashboard;
          const openMenu = !collapsed && expanded === item.label;
          const active = isActive(pathname, item);

          if (!item.children) {
            return (
              <Link
                key={item.label}
                href={item.href ?? "/"}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={`erp-nav-item ${active ? "is-active" : ""}`}
              >
                <Icon className="erp-nav-icon" />
                {!collapsed ? <span className="erp-nav-label">{item.label}</span> : null}
                {collapsed ? <span className="erp-tooltip">{item.label}</span> : null}
              </Link>
            );
          }

          return (
            <div key={item.label} className={`erp-nav-group ${active ? "has-active" : ""}`}>
              <button
                type="button"
                className={`erp-nav-item erp-nav-parent ${active ? "is-active" : ""}`}
                title={collapsed ? item.label : undefined}
                aria-expanded={openMenu}
                onClick={() => {
                  if (collapsed) return;
                  setExpanded(openMenu ? "" : item.label);
                }}
              >
                <Icon className="erp-nav-icon" />
                {!collapsed ? (
                  <>
                    <span className="erp-nav-label flex-1 text-left">{item.label}</span>
                    <ChevronDown className={`erp-chevron ${openMenu ? "is-open" : ""}`} />
                  </>
                ) : (
                  <span className="erp-tooltip">{item.label}</span>
                )}
              </button>
              {collapsed ? (
                <div className="erp-flyout" role="menu">
                  <p className="erp-flyout-title">{item.label}</p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className={`erp-flyout-link ${pathname === child.href ? "is-active" : ""}`}
                      title={child.label}
                    >
                      <span className="erp-sub-link-label">{child.label}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
              {openMenu ? (
                <div className="erp-submenu is-open">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        className={`erp-sub-link ${childActive ? "is-active" : ""}`}
                        title={child.label}
                      >
                        <span className="erp-sub-link-label">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

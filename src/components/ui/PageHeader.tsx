import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  subtitleClass?: string;
  crumbs: { label: string; href?: string }[];
};

export function PageHeader({ title, subtitle, subtitleClass = "", crumbs }: Props) {
  return (
    <div className="erp-pagehead">
      <div className="min-w-0">
        <nav className="erp-crumbs" aria-label="Breadcrumb">
          <Link href="/" className="erp-crumb-home" aria-label="Home">
            <Home className="h-3.5 w-3.5" />
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="erp-crumb">
              <ChevronRight className="h-3.5 w-3.5 text-[#c5cdd6]" aria-hidden />
              {c.href ? (
                <Link href={c.href}>{c.label}</Link>
              ) : (
                <span aria-current="page">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="erp-page-title">{title}</h1>
        {subtitle ? <p className={`erp-page-sub ${subtitleClass}`}>{subtitle}</p> : null}
      </div>
    </div>
  );
}

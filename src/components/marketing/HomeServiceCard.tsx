import Link from "next/link";
import {
  ArrowRight,
  Box,
  Package,
  PackageOpen,
  Truck,
  Warehouse,
  Zap,
} from "lucide-react";
import type { HomeService } from "@/data/marketing/homepage";

const icons: Record<HomeService["icon"], typeof Box> = {
  "part-load": PackageOpen,
  ftl: Truck,
  trailer: Truck,
  warehouse: Warehouse,
  express: Zap,
  door: Package,
};

export function HomeServiceCard({ service }: { service: HomeService }) {
  const Icon = icons[service.icon] ?? Box;

  return (
    <article className="mkt-service-card mkt-service-card-premium">
      <span className="mkt-service-icon">
        <Icon aria-hidden />
      </span>
      <span className="mkt-service-category">{service.category}</span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link href={service.href} className="mkt-service-link">
        Learn more <ArrowRight aria-hidden className="mkt-service-arrow" />
      </Link>
    </article>
  );
}

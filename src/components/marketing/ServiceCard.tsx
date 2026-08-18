import Link from "next/link";
import { ArrowRight, Box, Container, Headphones, PackageOpen, Truck, Warehouse } from "lucide-react";
import type { ServiceItem } from "@/data/marketing/services";

const icons = {
  "part-load": PackageOpen,
  ftl: Truck,
  trailer: Truck,
  container: Container,
  warehouse: Warehouse,
  care: Headphones,
};

export function ServiceCard({ service }: { service: ServiceItem }) {
  const Icon = icons[service.icon] ?? Box;
  return (
    <article id={service.id} className="mkt-service-card">
      <span className="mkt-service-icon">
        <Icon aria-hidden />
      </span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link href={service.href} className="mkt-service-link">
        Read more <ArrowRight aria-hidden />
      </Link>
    </article>
  );
}

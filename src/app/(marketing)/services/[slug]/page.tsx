import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { extraServices, services } from "@/data/marketing/services";
import { InnerPage } from "@/components/marketing/InnerPage";

const extras = extraServices.map((s) => ({
  id: s.id,
  title: s.title,
  description: s.points[0],
  body: s.points.join(" "),
  points: s.points as readonly string[],
}));

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...services, ...extraServices].map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.id === slug) ?? extras.find((s) => s.id === slug);
  return { title: service?.title ?? "Service" };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.id === slug);
  const extra = extras.find((s) => s.id === slug);
  if (!service && !extra) notFound();

  const title = service?.title ?? extra?.title ?? "";
  const subtitle = service?.description ?? extra?.description;

  return (
    <InnerPage eyebrow="Services" title={title} subtitle={subtitle} cta={{ href: "/quote", label: "Pickup Request" }}>
      {service ? <p>{service.body}</p> : null}
      {extra ? (
        <ul>
          {extra.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : null}
    </InnerPage>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { extraServices, services } from "@/data/marketing/services";
import { InnerPage } from "@/components/marketing/InnerPage";
import { JsonLd } from "@/components/marketing/JsonLd";
import { absoluteUrl, createPageMetadata, serviceJsonLd } from "@/lib/seo";

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
  const service = services.find((s) => s.id === slug);
  const extra = extraServices.find((s) => s.id === slug);
  const title = service?.title ?? extra?.title ?? "Service";
  const description =
    service?.seoDescription ??
    (extra ? `${extra.title} by DPR Logistics — ${extra.points[0]}` : "Logistics service by DPR Logistics.");
  return createPageMetadata({
    title: `${title} | Transport Service Kolhapur`,
    description,
    path: `/services/${slug}`,
    keywords: [
      title,
      `${title} Kolhapur`,
      `${title} Maharashtra`,
      "transport company Kolhapur",
      "part load FTL booking",
    ],
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.id === slug);
  const extra = extras.find((s) => s.id === slug);
  if (!service && !extra) notFound();

  const title = service?.title ?? extra?.title ?? "";
  const subtitle = service?.description ?? extra?.description;
  const seoDescription = service?.seoDescription ?? subtitle ?? "";

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          title,
          description: seoDescription,
          url: absoluteUrl(`/services/${slug}`),
        })}
      />
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
    </>
  );
}

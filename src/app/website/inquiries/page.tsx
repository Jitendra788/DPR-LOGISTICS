"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";

type WebInquiry = {
  id: number;
  type: string;
  referenceId: string;
  name: string;
  mobile: string;
  email: string;
  summary: string;
  payloadJson: string;
  emailed: boolean;
  createdAt: string;
};

export default function WebsiteInquiriesPage() {
  const { rows, message, remove } = useCrud<WebInquiry>("web-inquiries");

  return (
    <>
      <PageHeader
        title="Contact & Quote Inbox"
        subtitle="Messages from website contact and pickup forms (saved even when email is not configured)"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Contact & Quote Inbox" }]}
      />
      <Flash message={message} />

      <DataTable
        rows={rows}
        searchKeys={["referenceId", "name", "mobile", "email", "summary", "type"]}
        columns={[
          { key: "createdAt", header: "Date", render: (row) => new Date(row.createdAt).toLocaleString("en-IN") },
          { key: "type", header: "Type", render: (row) => (row.type === "quote" ? "Pickup / Quote" : "Contact") },
          { key: "referenceId", header: "Reference" },
          { key: "name", header: "Name" },
          { key: "mobile", header: "Mobile" },
          { key: "email", header: "Email" },
          { key: "summary", header: "Summary" },
          {
            key: "emailed",
            header: "Email sent",
            render: (row) => (row.emailed ? "Yes" : "Saved only"),
          },
          {
            key: "details",
            header: "Details",
            render: (row) => {
              try {
                const data = JSON.parse(row.payloadJson) as Record<string, string>;
                if (row.type === "contact") return data.message ?? "—";
                return [
                  data.pickupLocation && `From: ${data.pickupLocation}`,
                  data.deliveryLocation && `To: ${data.deliveryLocation}`,
                  data.shipmentType && `Type: ${data.shipmentType}`,
                  data.weight && `Weight: ${data.weight}`,
                ]
                  .filter(Boolean)
                  .join(" · ");
              } catch {
                return "—";
              }
            },
          },
          {
            key: "delete",
            header: "Delete",
            render: (row) => (
              <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>
                Delete
              </Button>
            ),
          },
        ]}
      />
    </>
  );
}

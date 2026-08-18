import type { Metadata } from "next";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "Vendor Registration" };

export default function VendorPage() {
  return (
    <InnerPage
      eyebrow="Partner Center"
      title="Vendor Registration"
      subtitle="Register as a lorry hire, fuel or service vendor."
      cta={{ href: "/contact", label: "Submit details" }}
    >
      <p>
        We work with fleet owners, brokers and service vendors. Share firm name, GST, vehicle types and operating
        routes via Contact Us. Approved vendors are added to our master for LHC and expense bookings.
      </p>
    </InnerPage>
  );
}

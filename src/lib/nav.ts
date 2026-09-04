export type NavChild = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href?: string;
  icon: string;
  children?: NavChild[];
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "gauge" },
  {
    label: "Master Data",
    icon: "monitor",
    children: [
      { label: "Party Creation", href: "/master/party" },
      { label: "User Creation", href: "/master/users" },
      { label: "Driver / Staff A/C", href: "/master/drivers" },
      { label: "Vehicle Creation", href: "/master/vehicles" },
      { label: "Vendor Creation", href: "/master/vendors" },
    ],
  },
  {
    label: "Booking",
    icon: "clipboard",
    children: [
      { label: "LR Booking", href: "/booking/lr" },
      { label: "Total Booking (MIS) Report", href: "/booking/mis-report" },
    ],
  },
  {
    label: "LHC",
    icon: "grid",
    children: [
      { label: "Lorry Hire Contract", href: "/lhc/contract" },
      { label: "LHC Payment", href: "/lhc/payment" },
      { label: "LHC Payment Update", href: "/lhc/payment-modify" },
      { label: "POD Status", href: "/lhc/pod-status" },
    ],
  },
  {
    label: "Bill Prepration",
    icon: "file",
    children: [
      { label: "Search Bill Status", href: "/bills/search" },
      { label: "Weightwise Bill", href: "/bills/weightwise" },
      { label: "Meterwise Bill", href: "/bills/meterwise" },
      { label: "Money Reciept", href: "/bills/money-receipt" },
      { label: "Party Ledger", href: "/bills/party-ledger" },
      { label: "Party Outstanding", href: "/bills/party-outstanding" },
      { label: "GST Summary Report", href: "/bills/gst-summary" },
      { label: "Billwise Outstanding Report", href: "/bills/billwise-outstanding" },
    ],
  },
  {
    label: "Other Data Entrys",
    icon: "plus-square",
    children: [
      { label: "Vendor Expense Vouher", href: "/other/vendor-voucher" },
      { label: "Vendor Oustanding", href: "/other/vendor-outstanding" },
      { label: "Vendor Ledger", href: "/other/vendor-ledger" },
    ],
  },
  {
    label: "Driver Data",
    icon: "user",
    children: [
      { label: "Driver A/C Creation", href: "/master/drivers" },
      { label: "Driver Voucher", href: "/driver-data/voucher" },
      { label: "Driver Outstanding", href: "/driver-data/outstanding" },
      { label: "Driver Ledger", href: "/driver-data/ledger" },
    ],
  },
  {
    label: "DPR Roadways Module",
    icon: "truck",
    children: [
      { label: "Booking Slip", href: "/roadways/booking-slip" },
      { label: "Booking Slip Payment", href: "/roadways/booking-slip-payment" },
      { label: "Booking Slip Outstanding Report", href: "/roadways/booking-slip-outstanding" },
      { label: "L.R", href: "/roadways/lr" },
      { label: "Bill Weightwise", href: "/roadways/bill-weightwise" },
      { label: "Bill Meterwise", href: "/roadways/bill-meterwise" },
      { label: "Search Bill", href: "/roadways/search-bill" },
      { label: "Money Reciept", href: "/roadways/money-receipt" },
      { label: "Billwise Outstanding Report", href: "/roadways/outstanding" },
      { label: "Party Ledger", href: "/roadways/party-ledger" },
      { label: "GST Summary Report", href: "/roadways/gst-summary" },
    ],
  },
  {
    label: "Self Vehicle Register",
    icon: "car",
    children: [
      { label: "Self Vehicle Setting", href: "/vehicle-register" },
      { label: "LHC Wise Booking Entry", href: "/vehicle-register/lhc-booking" },
      { label: "Maintanance Entry", href: "/vehicle-register/maintenance" },
      { label: "Tyre/Servicing Status", href: "/vehicle-register/tyre-status" },
      { label: "Monthwise Report", href: "/vehicle-register/monthwise" },
    ],
  },
  { label: "Trip Desk", href: "/trip-desk", icon: "truck" },
  { label: "Tracking Desk", href: "/tracking-desk", icon: "map" },
  {
    label: "Website Content",
    icon: "globe",
    children: [
      { label: "Blog Posts", href: "/website/blog" },
      { label: "Photos & Gallery", href: "/website/photos" },
      { label: "Contact & Quote Inbox", href: "/website/inquiries" },
    ],
  },
];

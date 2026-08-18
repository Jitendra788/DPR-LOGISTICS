import { company } from "./company";

export type Branch = {
  id: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  mapUrl: string;
  isSample: true;
};

export const networkCities = [
  "Kolhapur",
  "Mumbai",
  "Pune",
  "Ahmedabad",
  "Surat",
  "Delhi NCR",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Indore",
  "Nagpur",
] as const;

/** Branch and service-point data for the public network page. */
export const branches: Branch[] = [
  {
    id: "kolhapur-hq",
    city: "Kolhapur",
    state: "Maharashtra",
    address: company.address,
    phone: company.phone,
    email: company.email,
    workingHours: company.workingHours,
    mapUrl: "https://maps.google.com/?q=Kagal+MIDC+Kolhapur",
    isSample: true,
  },
  {
    id: "mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Regular lane coverage — Andheri, Bhiwandi & Navi Mumbai hubs",
    phone: company.phone,
    email: company.email,
    workingHours: company.workingHours,
    mapUrl: "https://maps.google.com/?q=Mumbai+Maharashtra",
    isSample: true,
  },
  {
    id: "pune",
    city: "Pune",
    state: "Maharashtra",
    address: "Regular lane coverage — Chakan, Pimpri & Hadapsar routes",
    phone: company.phone,
    email: company.email,
    workingHours: company.workingHours,
    mapUrl: "https://maps.google.com/?q=Pune+Maharashtra",
    isSample: true,
  },
  {
    id: "ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    address: "Regular lane coverage — Sarkhej & Sanand industrial belt",
    phone: company.phone,
    email: company.email,
    workingHours: company.workingHours,
    mapUrl: "https://maps.google.com/?q=Ahmedabad+Gujarat",
    isSample: true,
  },
  {
    id: "surat",
    city: "Surat",
    state: "Gujarat",
    address: "Regular lane coverage — Ring Road & Pandesara textile belt",
    phone: company.phone,
    email: company.email,
    workingHours: company.workingHours,
    mapUrl: "https://maps.google.com/?q=Surat+Gujarat",
    isSample: true,
  },
  {
    id: "delhi",
    city: "Delhi NCR",
    state: "Delhi",
    address: "Regular lane coverage — Gurgaon, Faridabad & Delhi hubs",
    phone: company.phone,
    email: company.email,
    workingHours: company.workingHours,
    mapUrl: "https://maps.google.com/?q=Delhi+NCR",
    isSample: true,
  },
  {
    id: "bangalore",
    city: "Bangalore",
    state: "Karnataka",
    address: "Regular lane coverage — Whitefield & Peenya industrial routes",
    phone: company.phone,
    email: company.email,
    workingHours: company.workingHours,
    mapUrl: "https://maps.google.com/?q=Bangalore+Karnataka",
    isSample: true,
  },
];

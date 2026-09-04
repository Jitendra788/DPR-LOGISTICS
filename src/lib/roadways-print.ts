export const roadwaysPrintCompany = {
  name: "DELHI PUNJAB ROADWAYS",
  tagline: "Fleet Owners & Transport Contractors",
  blessings: "|| Shree Ganesh Prasanna || Shri Mahalaxmi Prasanna ||",
  address: "Shree Mahalaxmi Petrol Pump 5 Star MIDC Road, Kagal Dist. Kolhapur 416216",
  email: "dprkolhapur@gmail.com",
  phones: "9371662142, 9326862142, 9356259949",
  pan: "NCSPS3662D",
  companyPan: "NCSPS3662D",
  companyGst: "",
  jurisdiction: "Subject To Kolhapur Jurisdiction",
  customerCare: "9356259949",
  bank: {
    name: "Bank Of India",
    accountNo: "094920110000555",
    ifsc: "BKID0000949",
    branch: "Gandhinagar Kolhapur",
  },
  terms: [
    "Please Insure your goods against damage & theft.",
    "Please check all document of vehicle before loading.",
    "Goods carried at owner risk. if open door & extra height charge pay you as per RTO Slip.",
    "We are not responsible for material leakage & breakage.",
    "We are not responsible for loss or damage of goods in case of any accident",
  ],
} as const;

export type LoadingMemoData = {
  slipNo: string;
  date: string;
  partyName: string;
  lorryNo: string;
  fromStation: string;
  toStation: string;
  guaranteeWeight: string;
  freight: number | string;
  advance: number | string;
  balance: number | string;
  remark?: string;
};

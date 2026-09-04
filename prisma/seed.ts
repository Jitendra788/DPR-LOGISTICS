import { PrismaClient } from "@prisma/client";
import { ORIGINAL_VEHICLE_NOS } from "../src/lib/original-vehicles";
import { hashPassword } from "../src/lib/auth-session";

const prisma = new PrismaClient();

async function main() {
  await prisma.tyreStatus.deleteMany();
  await prisma.bookingSlip.deleteMany();
  await prisma.driverVoucher.deleteMany();
  await prisma.vendorVoucher.deleteMany();
  await prisma.moneyReceipt.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.fleetVehicle.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.tripSheet.deleteMany();
  await prisma.driverAdvance.deleteMany();
  await prisma.driverRegister.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.lhcContract.deleteMany();
  await prisma.lrBooking.deleteMany();
  await prisma.rate.deleteMany();
  await prisma.station.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();
  await prisma.party.deleteMany();

  await prisma.user.createMany({
    data: [
      { username: "admin", password: hashPassword("admin123"), name: "Admin User", mobile: "9999999999", role: "Admin", branch: "DPR Logistics", status: "Active" },
      { username: "booking1", password: hashPassword("booking123"), name: "Rajesh Kumar", mobile: "9876543210", role: "Booking", branch: "Surat", email: "rajesh@dpr.com", status: "Active" },
    ],
  });

  await prisma.party.createMany({
    data: [
      { name: "PARAM TEX FAB PVT LTD", address: "VILLAGE-TANDE TALUKA-SHIRPUR DIST-DHULE", contact: "NO", gst: "27AADCP4916C1ZN", opDate: "2024-09-26", partyType: "Consigner/Consignee", partyCode: "1006", pan: "AADCP4916C" },
      { name: "SHAMMA COTFAB PVT LTD", address: "PLOT NO 12 MIDC JALGAON", contact: "0257-2211456", gst: "27AABCS8821P1Z4", opBalance: "0", opDate: "2024-08-12", partyType: "Consigner/Consignee", partyCode: "1007", pan: "AABCS8821P" },
      { name: "RAJESH TEXTILES", address: "45 INDUSTRIAL AREA SURAT", contact: "9876543210", gst: "24AABCR1234M1Z8", opBalance: "15000", opDate: "2024-04-01", partyType: "Consigner/Consignee", partyCode: "1008", pan: "AABCR1234M" },
      { name: "KRISHNA SPINNING MILLS", address: "RING ROAD SURAT", contact: "9825112233", gst: "24AADCK7788L1Z1", partyType: "Consigner/Consignee", partyCode: "1009", pan: "AADCK7788L" },
    ],
  });

  const detailedVehicles: Record<string, Record<string, string>> = {
    "MH-12-AB-1234": { ownerName: "RAMESH PATIL", ownerMob: "9876501234", ownerAadhar: "XXXX-XXXX-1234", ownerPan: "ABCDE1234F", ownerLicence: "MH1220140012345", engineNo: "ENG001", chassisNo: "CHS001", insuranceCompany: "National Insurance", policyNo: "POL-1001" },
    "MH-04-CD-5678": { ownerName: "SURESH SHINDE", ownerMob: "9822011122", ownerAadhar: "XXXX-XXXX-5678", ownerPan: "FGHIJ5678K", ownerLicence: "MH0420150056789", engineNo: "ENG002", chassisNo: "CHS002", insuranceCompany: "New India", policyNo: "POL-1002" },
    "GJ-01-EF-9012": { ownerName: "KIRAN DESAI", ownerMob: "9900990099", ownerAadhar: "XXXX-XXXX-9012", ownerPan: "KLMNO9012P", ownerLicence: "GJ0120160090123", engineNo: "ENG003", chassisNo: "CHS003" },
    MH09FL6933: { ownerName: "DPR FLEET", ownerMob: "9999999999" },
    MH47BY0205: { ownerName: "DPR FLEET", ownerMob: "9999999999" },
  };

  await prisma.vehicle.createMany({
    data: [...new Set(ORIGINAL_VEHICLE_NOS)].map((vehNo) => ({
      vehNo,
      ...(detailedVehicles[vehNo] ?? {}),
    })),
  });

  await prisma.driver.createMany({
    data: [
      { name: "VIKRAM SINGH", mobile: "9000011111", licenceNo: "MH142018009999", aadhar: "111122223333", pan: "VIKRS1234A", bankName: "SBI", accountNo: "12345678901", ifsc: "SBIN0001234", category: "Driver" },
      { name: "RAJU YADAV", mobile: "9000022222", licenceNo: "GJ012019008888", aadhar: "444455556666", pan: "RAJUY5678B", category: "Driver" },
      { name: "NITIN DIVDIAR", mobile: "9876500011", licenceNo: "MH142016001111", aadhar: "555566667777", pan: "NITND1234C", category: "Driver" },
      { name: "SOMNATH B SONVANE", mobile: "9876500022", licenceNo: "MH122017002222", aadhar: "888899990000", pan: "SOMNS5678D", category: "Driver" },
    ],
  });

  await prisma.vendor.createMany({
    data: [
      { name: "IOCL Diesel Pump", address: "NH-48 Surat", contact: "0261-2451001", gst: "24AAACI1681G1ZN", type: "Fuel" },
      { name: "National Insurance", address: "CG Road Ahmedabad", contact: "079-26581010", gst: "24AAACN9967E1Z2", type: "Insurance" },
      { name: "RAJ TRANSPORT", address: "Transport Nagar Surat", contact: "9825001111", pan: "AABCR1234R", type: "Broker" },
      { name: "SHREE LOGISTICS", address: "Narol Ahmedabad", contact: "9825002222", pan: "AAGCS8899L", type: "Broker" },
      { name: "MANMOHAN PRASAD PATHAK", address: "Transport Nagar", contact: "9825004444", type: "Other" },
      { name: "SONU YADAV", address: "Jalgaon", contact: "9825005555", type: "Other" },
      { name: "PAWAN DOCTOR", address: "Surat", contact: "9825006666", type: "Other" },
      { name: "RAKESH KUMAR", address: "Ahmedabad", contact: "9825007777", type: "Other" },
    ],
  });

  const stations = ["SURAT", "MUMBAI", "AHMEDABAD", "JALGAON", "DHULE", "PUNE", "NASHIK"];
  await prisma.station.createMany({
    data: stations.map((name, i) => ({ name, code: `ST${100 + i}` })),
  });

  await prisma.rate.createMany({
    data: [
      { fromStation: "SURAT", toStation: "MUMBAI", ratePerTon: 1800, effectiveDate: "2024-04-01" },
      { fromStation: "JALGAON", toStation: "AHMEDABAD", ratePerTon: 1600, effectiveDate: "2024-04-01" },
    ],
  });

  await prisma.lrBooking.createMany({
    data: [
      {
        bookingFrom: "SURAT",
        lrNo: "LR-22451",
        lrDate: "2024-08-14",
        fromStation: "SURAT",
        toStation: "MUMBAI",
        vehNo: "MH-12-AB-1234",
        deliveryAt: "DOOR",
        billingParty: "PARAM TEX FAB PVT LTD",
        consignor: "PARAM TEX FAB PVT LTD",
        consignee: "KRISHNA SPINNING MILLS",
        articles: "200",
        particulars: "COTTON BALES",
        chargedWeight: "22 FEET",
        freight: 45000,
        total: 45000,
        gst: 2250,
        grandTotal: 47250,
        billed: false,
        lhcNo: "",
        podStatus: "Pending",
      },
      {
        bookingFrom: "JALGAON",
        lrNo: "LR-22452",
        lrDate: "2024-08-14",
        fromStation: "JALGAON",
        toStation: "AHMEDABAD",
        vehNo: "MH-04-CD-5678",
        billingParty: "SHAMMA COTFAB PVT LTD",
        consignor: "SHAMMA COTFAB PVT LTD",
        consignee: "RAJESH TEXTILES",
        particulars: "YARN",
        chargedWeight: "18 TON",
        freight: 32000,
        total: 32000,
        gst: 1600,
        grandTotal: 33600,
        billed: false,
        lhcNo: "2249",
        podStatus: "Received",
      },
    ],
  });

  await prisma.lhcContract.create({
    data: {
      challanNo: "2249",
      challanDate: "2024-08-14",
      vehNo: "MH-04-CD-5678",
      fromStation: "JALGAON",
      toStation: "AHMEDABAD",
      ownerName: "SURESH SHINDE",
      ownerMob: "9822011122",
      driverName: "RAJU YADAV",
      brokerName: "SHREE LOGISTICS",
      lorryFreight: 28000,
      cash: 5000,
      fuel: 8000,
      totalAdvance: 13000,
      balance: 15000,
      lrNos: "LR-22452",
      paid: false,
    },
  });

  await prisma.fleetVehicle.createMany({
    data: [
      { vehNo: "MH-12-AB-1234", vehicleType: "Truck", capacity: "22 FT", status: "On Trip" },
      { vehNo: "MH-15-GH-4455", vehicleType: "Trailer", capacity: "32 FT", status: "Available" },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

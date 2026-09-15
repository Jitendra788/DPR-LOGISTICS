from pathlib import Path
import base64

logo_path = Path(r"e:\project\vmcindia\public\dpr-logo-header.png")
sign_path = Path(r"e:\project\vmcindia\public\dpr-authorized-signatory.png")
logo_b64 = base64.b64encode(logo_path.read_bytes()).decode("ascii")
sign_b64 = base64.b64encode(sign_path.read_bytes()).decode("ascii")

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>DPR Logistics — BA / Vendor Details</title>
<style>
  @page {{ size: A4 portrait; margin: 10mm; }}
  * {{ box-sizing: border-box; }}
  html, body {{
    margin: 0;
    padding: 0;
    color: #111;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    line-height: 1.3;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}
  .sheet {{ width: 100%; max-width: 190mm; margin: 0 auto; }}
  .letterhead {{
    display: grid;
    grid-template-columns: 82px 1fr;
    gap: 8px;
    align-items: start;
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 6px;
    margin-bottom: 8px;
  }}
  .logo {{ width: 76px; height: auto; object-fit: contain; }}
  .brand-name {{ margin: 0; color: #b91c1c; font-size: 22px; font-weight: 800; }}
  .tagline {{
    margin: 1px 0 4px;
    font-family: "Times New Roman", Times, serif;
    font-size: 11.5px;
    font-weight: 700;
    color: #1e3a8a;
  }}
  .addr {{ margin: 0; color: #1d4ed8; font-size: 10.5px; font-weight: 600; word-break: break-word; }}
  .mob {{ margin: 2px 0 0; color: #b91c1c; font-size: 11px; font-weight: 700; }}
  .date-line {{ text-align: right; margin: 0 0 8px; font-weight: 700; font-size: 11.5px; }}
  h2 {{ margin: 0 0 8px; text-align: center; font-size: 13px; text-decoration: underline; }}
  table.vendor {{
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin-bottom: 10px;
  }}
  table.vendor th,
  table.vendor td {{
    border: 1px solid #111;
    padding: 4px 3px;
    vertical-align: top;
    text-align: left;
    word-break: break-word;
    overflow-wrap: anywhere;
    white-space: normal;
    font-size: 8.5px;
    line-height: 1.25;
  }}
  table.vendor th {{
    background: #f3f4f6;
    font-weight: 700;
    text-align: center;
  }}
  table.vendor td {{ font-weight: 600; }}
  .meta p {{ margin: 0 0 6px; font-size: 12px; }}
  .sign {{
    margin-top: 28px;
    width: 52%;
  }}
  .sign img {{
    display: block;
    width: 280px;
    max-width: 100%;
    height: auto;
  }}
  .print-hint {{
    margin-top: 14px;
    padding: 8px 10px;
    background: #fff7ed;
    border: 1px dashed #ea580c;
    font-size: 11px;
  }}
  @media print {{ .print-hint {{ display: none !important; }} }}
</style>
</head>
<body>
  <div class="sheet">
    <div class="letterhead">
      <img class="logo" src="data:image/png;base64,{logo_b64}" alt="DPR Logistics" />
      <div>
        <h1 class="brand-name">DPR Logistics</h1>
        <div class="tagline">Fleet Owners &amp; Transport Contractors</div>
        <p class="addr">Shree Mahalaxmi Petrol Pump, 5 Star MIDC Road, Kagal, Dist. Kolhapur 416216<br/>Email : dprkolhapur@gmail.com</p>
        <p class="mob">Mob : 9371662142 , 9326862142 , 9356259949</p>
      </div>
    </div>

    <div class="date-line">Date : ____ / ____ / 20____</div>
    <h2>BA / Vendor Company Details</h2>

    <p style="margin:0 0 8px;font-size:11.5px;"><strong>Registered under MSMED or not (if registered please share Udhyam Certificate) :</strong> Yes / No</p>

    <table class="vendor">
      <colgroup>
        <col style="width:5%" />
        <col style="width:10%" />
        <col style="width:9%" />
        <col style="width:17%" />
        <col style="width:9%" />
        <col style="width:8%" />
        <col style="width:13%" />
        <col style="width:12%" />
        <col style="width:11%" />
        <col style="width:6%" />
      </colgroup>
      <thead>
        <tr>
          <th>S. No.</th>
          <th>Vendor company Name</th>
          <th>For Sector</th>
          <th>Office/Registered address</th>
          <th>Sign authority Name</th>
          <th>contact No.</th>
          <th>Email id</th>
          <th>Agreement Type RCM- NO GST ON BILLS /FCM-GST ON BILLS</th>
          <th>Available Vehicle Types</th>
          <th>Count of Own Vehicle</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center;">1</td>
          <td>DPR Logistics</td>
          <td>Logistics / Transport</td>
          <td>Shree Mahalaxmi Petrol Pump, 5 Star MIDC Road, Kagal, Dist. Kolhapur 416216</td>
          <td>Rakesh Kumar</td>
          <td>9371662142</td>
          <td>dprlogistics2142@gmail.com / dprkolhapur@gmail.com</td>
          <td>FCM-GST ON BILLS</td>
          <td>Truck, Trailer, Container and All Types Vehicle</td>
          <td>10 + Attached fleet</td>
        </tr>
      </tbody>
    </table>

    <div class="meta">
      <p><strong>Business Operated as Proprietorship/Partnership/Company :</strong> Proprietorship</p>
      <p style="font-size:10.5px;margin-top:-3px;">(Partnership deed to be attached in case Partnership)</p>
      <p><strong>Contact Person :</strong> Rakesh Kumar</p>
      <p><strong>Mobile no :</strong> 9371662142</p>
      <p><strong>Email Id :</strong> dprlogistics2142@gmail.com / dprkolhapur@gmail.com</p>
    </div>

    <div class="sign">
      <img src="data:image/png;base64,{sign_b64}" alt="Authorized Signatory — Rakesh Kumar / Stamp" />
    </div>

    <div class="print-hint">
      Print: Ctrl+P → <strong>A4 Portrait</strong> → Margins Default → Background graphics ON<br/>
      File: c:\\Users\\jiten\\Downloads\\DPR_Logistics_BA_Vendor_Details_Letterhead.html
    </div>
  </div>
</body>
</html>
"""

out_html = Path(r"c:\Users\jiten\Downloads\DPR_Logistics_BA_Vendor_Details_Letterhead.html")
out_html.write_text(html, encoding="utf-8")
print("Updated", out_html)

# Also copy refreshed Excel to Downloads editable blackfix if present
src = Path(r"e:\project\vmcindia\BA_Selection_Criteria_DPR_Logistics_Editable_BlackFix.xlsx")
if src.exists():
    dest = Path(r"c:\Users\jiten\Downloads\BA_Selection_Criteria_DPR_Logistics_Editable_BlackFix.xlsx")
    dest.write_bytes(src.read_bytes())
    print("Copied", dest)

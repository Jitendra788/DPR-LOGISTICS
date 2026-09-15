from pathlib import Path
import base64

logo_path = Path(r"e:\project\vmcindia\public\dpr-logo-header.png")
logo_b64 = base64.b64encode(logo_path.read_bytes()).decode("ascii")

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>DPR Logistics — Letterhead</title>
<style>
  @page {{ size: A4 portrait; margin: 12mm; }}
  * {{ box-sizing: border-box; }}
  html, body {{
    margin: 0;
    padding: 0;
    color: #111;
    font-family: Arial, Helvetica, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}
  .sheet {{
    width: 100%;
    max-width: 186mm;
    margin: 0 auto;
    min-height: 270mm;
  }}
  .letterhead {{
    display: grid;
    grid-template-columns: 95px 1fr;
    gap: 10px;
    align-items: start;
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 8px;
    margin-bottom: 10px;
  }}
  .logo {{ width: 90px; height: auto; object-fit: contain; }}
  .brand-name {{
    margin: 0;
    color: #b91c1c;
    font-size: 26px;
    font-weight: 800;
  }}
  .tagline {{
    margin: 2px 0 5px;
    font-family: "Times New Roman", Times, serif;
    font-size: 13px;
    font-weight: 700;
    color: #1e3a8a;
  }}
  .addr {{
    margin: 0;
    color: #1d4ed8;
    font-size: 11.5px;
    font-weight: 600;
    word-break: break-word;
  }}
  .mob {{
    margin: 3px 0 0;
    color: #b91c1c;
    font-size: 12px;
    font-weight: 700;
  }}
  .date-line {{
    text-align: right;
    margin: 0 0 16px;
    font-weight: 700;
    font-size: 12.5px;
  }}
  .body-space {{
    min-height: 200mm;
  }}
  .print-hint {{
    margin-top: 12px;
    padding: 8px 10px;
    background: #fff7ed;
    border: 1px dashed #ea580c;
    font-size: 11.5px;
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
    <div class="body-space"></div>
    <div class="print-hint">
      Empty letterhead — Ctrl+P → A4 Portrait → Background graphics ON<br/>
      File: c:\\Users\\jiten\\Downloads\\DPR_Logistics_Letterhead_Empty.html
    </div>
  </div>
</body>
</html>
"""

out = Path(r"c:\Users\jiten\Downloads\DPR_Logistics_Letterhead_Empty.html")
out.write_text(html, encoding="utf-8")
print("Wrote", out)

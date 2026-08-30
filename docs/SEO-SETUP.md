# DPR Logistics — Google Search Console + Business Profile Setup

Aapki site pe SEO keywords already add ho chuke hain. Search mein **dikhai** dene ke liye Google ko site + office verify karna zaroori hai. Is guide ko step-by-step follow karo.

**Website:** https://www.dprlogistics.in/  
**Sitemap:** https://www.dprlogistics.in/sitemap.xml  
**Office:** Shree Mahalaxmi Petrol Pump, 5 Star MIDC Road, Kagal, Dist. Kolhapur 416216  
**Phone:** +91 93562 59949 / +91 93716 62142  
**Email:** dprlogistics2142@gmail.com  
**GSTIN:** 27BNLPK2073C1Z5  

> Tip: Office / business ka **Gmail** use karo (personal random account avoid). Same Google account se Search Console + Business Profile + Analytics chalana best hai.

---

## Part A — Google Search Console (website Google pe index)

### 1) Property banao

1. Open: [Google Search Console](https://search.google.com/search-console)
2. **Add property** → choose **Domain** (best) ya **URL prefix**
   - **Domain:** `dprlogistics.in` (www + non-www dono cover)
   - **URL prefix (simple):** `https://www.dprlogistics.in`
3. Agar Domain choose kiya → DNS TXT record hosting pe add karna padega (GoDaddy / Hostinger / Cloudflare jahan domain hai).
4. Agar URL prefix choose kiya → **HTML tag** ya **Google Analytics** verification easy hai.

### 2) Verify (URL prefix — HTML tag method)

1. Search Console verification page pe **HTML tag** copy karo  
   Example shape: `<meta name="google-site-verification" content="...." />`
2. Developer ko bolo is tag ko site ke `<head>` me add kare  
   (Next.js me root / marketing layout ke metadata me `verification.google` field).
3. Tag live hone ke baad Search Console me **Verify** dabao.

**HTML file upload** method bhi chal sakta hai: file `public/` folder me rakh ke deploy.

### 3) Sitemap submit (bahut important)

1. Search Console → left menu **Sitemaps**
2. Add sitemap URL:

```text
https://www.dprlogistics.in/sitemap.xml
```

3. Submit → status **Success** aana chahiye (1–2 din me pages list hone shuru).

### 4) Important pages request indexing

Search Console → **URL Inspection** → ye URLs ek-ek karke paste → **Request indexing**:

| Priority | URL |
|---|---|
| High | `https://www.dprlogistics.in/` |
| High | `https://www.dprlogistics.in/tracking` |
| High | `https://www.dprlogistics.in/services` |
| High | `https://www.dprlogistics.in/quote` |
| High | `https://www.dprlogistics.in/contact` |
| Medium | `https://www.dprlogistics.in/routes` |
| Medium | `https://www.dprlogistics.in/contact/faq` |
| Medium | `https://www.dprlogistics.in/about` |
| Medium | `https://www.dprlogistics.in/network` |

Daily limit ~10–20 requests — sab ek din me force mat karo.

### 5) Weekly check (kya dekhna hai)

| Report | Kya dekho |
|---|---|
| **Performance** | Queries, clicks, impressions — “DPR Logistics”, “transport Kolhapur”, “part load” |
| **Pages / Indexing** | Error / Not indexed pages fix |
| **Sitemaps** | Success + discovered URLs |
| **Experience** | Mobile / Core Web Vitals warnings |

### 6) Brand search test (1–2 hafte baad)

Google me search:

- `DPR Logistics`
- `DPR Logistics Kolhapur`
- `dprlogistics.in`
- `transport company Kolhapur`
- `part load Kolhapur`
- `GC tracking DPR`

Pehle brand searches aayenge; local service searches thoda time leti hain.

---

## Part B — Google Business Profile (Maps + local search)

Local searches jaise **“transport company near me”** / **“transport company Kolhapur”** ke liye ye sabse powerful hai.

### 1) Profile create / claim

1. Open: [Google Business Profile](https://business.google.com/) ya Maps pe “Add your business”
2. Business name: **DPR Logistics**
3. Category (primary): **Transportation service** / **Freight forwarding service** / **Logistics service**  
   Secondary: Trucking company, Warehouse, Courier service (jo fit ho)
4. Location: **Kagal / Kolhapur office address** exactly:

```text
Shree Mahalaxmi Petrol Pump
5 Star M.I.D.C Road, Kagal
Distt. Kolhapur, Maharashtra - 416216
```

5. Service area: Maharashtra + Gujarat + major metros (Pune, Mumbai, Bangalore, Ahmedabad, Surat, Delhi, Hyderabad, Chennai) — pan-India note bhi likh sakte ho.
6. Phone: **+91 93562 59949** (primary), second number bhi add.
7. Website: **https://www.dprlogistics.in/**
8. Hours: **Mon–Sat 9:00 AM – 7:00 PM** (Sunday Closed, unless you work).

### 2) Verify (postcard / phone / video)

Google verification method suggest karega (postcard, phone, email, or video).  
Office address sahi hona chahiye — verification ke bina full ranking nahi milti.

### 3) Profile complete karo (100% fill)

Fill these fields carefully.

#### Business description — copy & paste (ready)

Google Business Profile → **Edit profile** → **Business information** → **From the business** / Description.

**Short (optional / about snippet):**

```text
DPR Logistics — transport company in Kolhapur (Kagal MIDC). Part load, FTL, trailer, container & warehousing with online GC/LR tracking. Call +91 93562 59949.
```

**Full business description (paste this — under Google’s 750-character limit):**

```text
DPR Logistics is a cargo transport company from Kagal MIDC, Kolhapur, Maharashtra. We offer pan-India part load, full truck load (FTL), trailer, container and warehousing for manufacturers, traders and distributors.

Book pickup by phone or online, get GST billing with LR copies, and track GC/LR on dprlogistics.in. Lanes cover Maharashtra, Gujarat, Pune, Mumbai, Bangalore, Ahmedabad, Surat, Delhi, Hyderabad and Chennai.

Office: Shree Mahalaxmi Petrol Pump, 5 Star MIDC Road, Kagal, Kolhapur 416216. Mon–Sat 9 AM–7 PM. Call +91 93562 59949 / +91 93716 62142. Email dprlogistics2142@gmail.com. GSTIN 27BNLPK2073C1Z5.
```

**Services to add (one by one):**

- Part load transport  
- Full truck load (FTL)  
- Trailer transport  
- Container transport  
- Warehousing & distribution  
- GC / LR online tracking  
- Cargo pickup booking  
- POD / proof of delivery support  

Same text is also stored in code: `company.googleBusiness` in `src/data/marketing/company.ts`.

| Field | Suggested text |
|---|---|
| **Attributes** | Only mark what is true for your office |
| **Photos** | Office board, trucks, warehouse, staff, GST board, visiting card (min 10 photos) |
| **Logo** | DPR logo (site wala) |
| **Cover** | Truck / warehouse photo |
| **Booking / Appointment link** | `https://www.dprlogistics.in/quote` |

### 4) Posts & reviews (ranking boost)

- Har week 1 **Google Post**: offer / route update / “Track GC online”
- Customers se **Google review** maango (WhatsApp pe link share)
- Har review ka **reply** do (Hindi / English mix OK)
- Q&A section me khud questions add karo:
  - How to track LR?
  - Do you do part load from Kolhapur?
  - What is your GSTIN?

### 5) NAP consistency (bahut important)

Har jagah **same** Name, Address, Phone:

- Google Business Profile  
- Website footer / contact page  
- Visiting card / letterhead  
- Facebook / Justdial / IndiaMART (agar ho)

Mismatch = ranking weak.

---

## Part C — Extra checklist (fast results)

1. **Google Analytics** (agar already site pe hai) → Search Console se link karo  
2. Website pe **phone click-to-call** + WhatsApp button (already mostly hai)  
3. Office ka **Google Maps embed** contact page pe (optional next task)  
4. **IndiaMART / Justdial / Sulekha** pe free listing — website + same NAP  
5. Har new blog / route page ke baad Search Console me index request  
6. Mobile pe site speed check: [PageSpeed Insights](https://pagespeed.web.dev/) — URL `dprlogistics.in`

---

## Part D — Developer handoff (verification tag)

Jab Search Console **HTML tag** de, developer se ye add karwana:

**File idea:** `src/app/(marketing)/layout.tsx` metadata me:

```ts
verification: {
  google: "PASTE_CODE_HERE", // only the content= value, not full meta tag
},
```

Example:

```ts
export const metadata: Metadata = {
  // ...existing fields
  verification: {
    google: "AbCdEf123456...",
  },
};
```

Deploy ke baad Search Console → **Verify**.

---

## Expected timeline (realistic)

| Time | Expect |
|---|---|
| Day 1 | Search Console + GBP create / verify start |
| 3–7 days | Homepage + key pages indexed; brand search improve |
| 2–4 weeks | “DPR Logistics Kolhapur” stable; Maps pe profile dikhe |
| 1–3 months | “transport company Kolhapur”, “part load Kolhapur” pe competition ke saath gradual ranking |

Keywords site pe hain — ab **Google verify + reviews + consistent NAP** se search traffic aayegi.

---

## Quick links

- [Search Console](https://search.google.com/search-console)
- [Business Profile](https://business.google.com/)
- [Sitemap](https://www.dprlogistics.in/sitemap.xml)
- [Track page](https://www.dprlogistics.in/tracking)
- [Pickup / Quote](https://www.dprlogistics.in/quote)
- [Contact](https://www.dprlogistics.in/contact)

---

## Help needed from developer later

Agar aap Search Console se **google-site-verification** code bhej doge, woh seedha website pe add karke push kar denge.

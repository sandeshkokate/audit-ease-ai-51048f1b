export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  author: string;
  tags: string[];
  readingTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'courier-billing-errors-india',
    title: 'Why Indian E-Commerce Brands Lose 2–5% of Shipping Costs to Billing Errors',
    description: 'A breakdown of the most common courier billing mistakes — weight rounding, zone misclassification, and RTO overcharges — and how much they cost your business.',
    publishedAt: '2026-03-01',
    author: 'AuditEase Team',
    tags: ['courier billing', 'shipping costs', 'D2C India'],
    readingTime: '5 min read',
    content: `
<h2>The Hidden Cost in Every Courier Invoice</h2>
<p>If you ship 1,000 orders a month and spend ₹80 per shipment on average, you are spending ₹80,000 monthly on courier charges. Industry data suggests 2–5% of that — ₹1,600 to ₹4,000 — is being billed incorrectly. Multiply that over 12 months and you are looking at ₹19,000 to ₹48,000 in recoverable overcharges. For a brand shipping 10,000 orders a month, that number becomes ₹1.9L to ₹4.8L annually.</p>

<h2>The Three Most Common Errors</h2>

<h3>1. Weight Discrepancies</h3>
<p>Couriers charge based on the higher of actual weight and volumetric weight (L × B × H / 5000). When their weighing machine reads 2.1 kg but your product weighs 1.8 kg, you get billed for 2.1 kg on every single shipment. At scale, small weight rounding errors add up to large overcharges.</p>

<h3>2. Zone Misclassification</h3>
<p>Shipping rates vary by zone — a shipment from Mumbai to Delhi (Zone B) costs less than Mumbai to Kolkata (Zone C). If a courier misclassifies the destination zone, you pay the wrong rate. Zone errors are particularly common for pincodes that sit on zone boundaries.</p>

<h3>3. RTO Overcharges</h3>
<p>Return to Origin shipments have their own rate card. Some couriers charge RTO fees even on delivered shipments, or charge the forward rate instead of the discounted RTO rate. These errors are nearly impossible to catch manually when you are processing hundreds of invoices a month.</p>

<h2>Why Manual Auditing Fails</h2>
<p>Most operations teams reconcile courier invoices using Excel. They download the courier's billing statement, compare it against their own shipment data, and try to match AWB numbers. This process takes hours, requires specialist knowledge of each courier's rate card, and misses errors in bulk rows where the discrepancy is just ₹10–₹20 per shipment.</p>
<p>The problem is not effort — it is scale. A human auditor can realistically check 50–100 shipments per hour. If you process 5,000 shipments a month, a full audit takes 50–100 hours of skilled work.</p>

<h2>Automated Auditing Changes the Math</h2>
<p>AuditEase AI compares every shipment in your courier invoice against your agreed rate card, checks the actual vs charged weight, verifies the zone mapping against our pincode database, and flags every shipment where the billed amount exceeds the expected amount — in minutes, not hours.</p>
<p>You get a list of every discrepancy with the exact overcharge amount and a ready-to-send dispute email for each one.</p>
`
  },
  {
    slug: 'how-to-dispute-courier-billing-errors',
    title: 'How to Successfully Dispute Courier Billing Errors and Actually Get Your Money Back',
    description: 'A practical guide to raising billing disputes with Delhivery, BlueDart, Ecom Express, and other major Indian couriers — including email templates and timelines.',
    publishedAt: '2026-03-10',
    author: 'AuditEase Team',
    tags: ['dispute management', 'courier billing', 'recovery'],
    readingTime: '7 min read',
    content: `
<h2>The Dispute Process Most Brands Get Wrong</h2>
<p>Raising a billing dispute with a courier is not complicated, but most brands do it wrong — and then give up when they get no response. Here is what actually works.</p>

<h3>Step 1: Document Everything First</h3>
<p>Before you contact the courier, have these ready: the original AWB number, your invoice showing what was charged, your rate card showing what should have been charged, and the exact discrepancy amount. Couriers reject disputes that lack specific evidence. "You overcharged me" does not work. "AWB 123456789 was billed at Zone C rate (₹215) but origin-destination pincode pair 400001-110001 is Zone B under clause 4.2 of our rate card (₹165), resulting in a ₹50 overcharge" works.</p>

<h3>Step 2: Use the Right Channel</h3>
<p>Every major courier has a dedicated billing dispute email. Using the general customer care email or calling the helpline wastes time — those teams cannot process billing adjustments.</p>
<ul>
<li><strong>Delhivery:</strong> billing@delhivery.com</li>
<li><strong>BlueDart:</strong> billingqueries@bluedart.com</li>
<li><strong>Ecom Express:</strong> billing@ecomexpress.in</li>
<li><strong>DTDC:</strong> billing@dtdc.com</li>
<li><strong>XpressBees:</strong> billing@xpressbees.com</li>
</ul>

<h3>Step 3: The Subject Line Matters</h3>
<p>Use this exact format: "Billing Dispute — AWB [number] | Order [ID] | [Discrepancy Type]". Billing teams process hundreds of emails a day. A clear subject line gets your dispute into the right queue faster.</p>

<h3>Step 4: Follow Up Systematically</h3>
<p>If you have not heard back in 5 working days, send a follow-up. If no response in 10 days, escalate to the account manager. Keep every email in a thread so the history is visible. Couriers are more likely to process disputes when they see a paper trail.</p>

<h2>Realistic Recovery Timelines</h2>
<p><strong>Weight disputes:</strong> 7–14 working days. <strong>Zone disputes:</strong> 14–21 working days. <strong>RTO disputes:</strong> 10–14 working days. Credit notes, once approved, are typically applied to your next invoice rather than refunded in cash.</p>
`
  },
  {
    slug: 'delhivery-rate-card-explained',
    title: 'Delhivery Rate Card Explained: Zones, Weight Slabs, and What to Check on Every Invoice',
    description: 'A complete breakdown of how Delhivery calculates shipping charges — zone classification, volumetric weight, surface vs air, COD charges, and common billing errors.',
    publishedAt: '2026-03-18',
    author: 'AuditEase Team',
    tags: ['Delhivery', 'rate card', 'courier billing'],
    readingTime: '6 min read',
    content: `
<h2>How Delhivery Calculates Your Shipping Charge</h2>
<p>Delhivery is India's largest third-party logistics provider, handling over 1 million shipments daily. Understanding their rate card is essential for any D2C brand that uses them — and for auditing whether your invoices are correct.</p>

<h3>Zone Classification</h3>
<p>Delhivery divides India into zones based on origin-destination pincode pairs. The zones are A through F, with A being the shortest distance (typically same city) and F being the longest (North to South extremes). Your rate card specifies a per-kg charge for each zone and mode (surface or air).</p>
<p>Zone classification errors happen when: the destination pincode is new and not yet in Delhivery's zone master, the shipment routes through an intermediate hub that changes the zone, or there is a data entry error at the pickup point.</p>

<h3>Volumetric Weight</h3>
<p>Delhivery charges the higher of actual weight and volumetric weight. Volumetric weight formula: (Length cm × Breadth cm × Height cm) / 5000. A 30 × 25 × 20 cm box has volumetric weight of 3 kg. If the actual product weighs 1.5 kg, you are billed for 3 kg. This is correct per your rate card — but only if the dimensions are measured accurately. Common errors include measuring the outer carton instead of the original product dimensions, or rounding up unnecessarily.</p>

<h3>Weight Slabs</h3>
<p>Delhivery bills in 0.5 kg increments. A 1.3 kg shipment is billed as 1.5 kg. A 1.6 kg shipment is billed as 2.0 kg. Errors occur when couriers round up to the next full kg instead of the next 0.5 kg slab, resulting in systematic overcharges.</p>

<h2>What to Check on Every Invoice</h2>
<p>For each AWB: verify the billed weight matches your records, verify the zone matches the origin-destination pincode pair in your rate card, verify RTO shipments are billed at the RTO rate and not the forward rate, verify COD charges match the COD amount collected and not the shipment value.</p>
`
  },
];

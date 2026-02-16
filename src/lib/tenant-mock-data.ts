// Tenant-specific mock data

export const mockAuditLogs = Array.from({ length: 50 }, (_, i) => ({
  id: `AL-${1000 + i}`,
  awb_number: `AWB${100000 + i}`,
  courier: ['Delhivery', 'BlueDart', 'DTDC', 'Ecom Express', 'Shadowfax'][i % 5],
  order_id: `ORD-${5000 + i}`,
  billed_weight: +(Math.random() * 5 + 0.5).toFixed(2),
  actual_weight: +(Math.random() * 4 + 0.3).toFixed(2),
  dead_weight: +(Math.random() * 3 + 0.2).toFixed(2),
  volumetric_weight: +(Math.random() * 5 + 0.5).toFixed(2),
  billed_zone: ['A', 'B', 'C', 'D', 'E'][i % 5],
  actual_zone: ['A', 'B', 'C', 'D'][i % 4],
  billed_amount: +(Math.random() * 200 + 50).toFixed(2),
  expected_amount: +(Math.random() * 150 + 40).toFixed(2),
  discrepancy_amount: +(Math.random() * 80 + 5).toFixed(2),
  discrepancy_type: ['weight', 'zone', 'rto', 'cod', 'other'][i % 5] as 'weight' | 'zone' | 'rto' | 'cod' | 'other',
  status: ['detected', 'disputed', 'resolved', 'rejected'][i % 4] as 'detected' | 'disputed' | 'resolved' | 'rejected',
  dispute_status: ['draft_created', 'email_copied', 'raised', 'recovered', 'pending'][i % 5],
  created_at: new Date(Date.now() - i * 3600000 * 6).toISOString(),
  dispute_reasoning: {
    issues: [
      { type: 'weight', description: 'Billed weight exceeds actual by 1.2kg', charged: 3.5, expected: 2.3 },
      { type: 'zone', description: 'Incorrect zone mapping B→A', charged: 'B', expected: 'A' },
    ],
    summary: 'Overcharged ₹45 due to weight discrepancy and zone mismatch',
  },
  timeline: [
    { event: 'Uploaded', date: new Date(Date.now() - i * 3600000 * 6).toISOString() },
    { event: 'Discrepancy Detected', date: new Date(Date.now() - i * 3600000 * 5).toISOString() },
    { event: 'Email Drafted', date: new Date(Date.now() - i * 3600000 * 4).toISOString() },
    ...(i % 3 === 0 ? [{ event: 'Email Sent', date: new Date(Date.now() - i * 3600000 * 3).toISOString() }] : []),
    ...(i % 4 === 0 ? [{ event: 'Recovered', date: new Date(Date.now() - i * 3600000 * 2).toISOString() }] : []),
  ],
}));

export const mockDisputes = Array.from({ length: 20 }, (_, i) => ({
  id: `DSP-${2000 + i}`,
  audit_log_id: `AL-${1000 + i}`,
  awb_number: `AWB${100000 + i}`,
  courier: ['Delhivery', 'BlueDart', 'DTDC', 'Ecom Express'][i % 4],
  courier_email: ['billing@delhivery.com', 'disputes@bluedart.com', 'finance@dtdc.com', 'claims@ecomexpress.in'][i % 4],
  amount: +(Math.random() * 100 + 15).toFixed(2),
  status: ['draft', 'email_copied', 'raised', 'recovered', 'rejected'][i % 5] as any,
  is_copied: i % 5 >= 1,
  is_marked_sent: i % 5 >= 2,
  email_subject: `Billing Dispute - AWB${100000 + i} - Weight/Zone Discrepancy`,
  email_body: `Dear ${['Delhivery', 'BlueDart', 'DTDC', 'Ecom Express'][i % 4]} Billing Team,\n\nWe are writing to dispute the charges for shipment AWB${100000 + i}.\n\nOur records indicate a discrepancy of ₹${(Math.random() * 100 + 15).toFixed(2)} between the billed amount and the expected amount based on actual weight and zone calculations.\n\nDetails:\n- AWB: AWB${100000 + i}\n- Billed Weight: ${(Math.random() * 5 + 0.5).toFixed(2)} kg\n- Actual Weight: ${(Math.random() * 4 + 0.3).toFixed(2)} kg\n- Billed Zone: ${['A', 'B', 'C', 'D'][i % 4]}\n- Actual Zone: ${['A', 'B', 'C'][i % 3]}\n\nWe request a credit note for the overcharged amount at the earliest.\n\nRegards,\nFastShip Logistics`,
  dispute_reasoning: {
    issues: [
      { type: 'weight', description: `Weight discrepancy of ${(Math.random() * 2).toFixed(1)}kg`, impact: +(Math.random() * 50 + 10).toFixed(2) },
      ...(i % 2 === 0 ? [{ type: 'zone', description: 'Zone mismatch detected', impact: +(Math.random() * 30 + 5).toFixed(2) }] : []),
    ],
    total_overcharge: +(Math.random() * 100 + 15).toFixed(2),
  },
  created_at: new Date(Date.now() - i * 7200000).toISOString(),
}));

export const mockRecoveries = [
  { id: 'R1', credit_note_number: 'CN-4521', awb: 'AWB100003', order_id: 'ORD-5003', amount: 45.50, date: '2026-02-10', status: 'matched', match_type: 'auto' },
  { id: 'R2', credit_note_number: 'CN-4522', awb: 'AWB100007', order_id: 'ORD-5007', amount: 78.20, date: '2026-02-11', status: 'matched', match_type: 'auto' },
  { id: 'R3', credit_note_number: 'CN-4523', awb: 'AWB100012', order_id: 'ORD-5012', amount: 32.00, date: '2026-02-12', status: 'review', match_type: 'partial' },
  { id: 'R4', credit_note_number: 'CN-4524', awb: '', order_id: '', amount: 125.00, date: '2026-02-13', status: 'unmatched', match_type: 'none' },
  { id: 'R5', credit_note_number: 'CN-4525', awb: 'AWB100020', order_id: 'ORD-5020', amount: 56.80, date: '2026-02-14', status: 'matched', match_type: 'auto' },
];

export const mockInvoices = [
  { id: 'INV-001', invoice_number: 'AE-2026-001', period: 'January 2026', total_recovered: 285000, commission: 34200, gst: 6156, net_payable: 40356, status: 'paid', line_items: 45, created_at: '2026-02-01' },
  { id: 'INV-002', invoice_number: 'AE-2026-002', period: 'February 2026', total_recovered: 320000, commission: 38400, gst: 6912, net_payable: 45312, status: 'pending', line_items: 52, created_at: '2026-02-15' },
  { id: 'INV-003', invoice_number: 'AE-2025-012', period: 'December 2025', total_recovered: 245000, commission: 29400, gst: 5292, net_payable: 34692, status: 'paid', line_items: 38, created_at: '2026-01-01' },
];

export const mockTeamMembers = [
  { id: '1', name: 'Rajesh Kumar', email: 'rajesh@fastship.in', role: 'tenant_admin', status: 'active', last_login: '2026-02-16T10:30:00Z' },
  { id: '2', name: 'Amit Patel', email: 'amit@fastship.in', role: 'accountant', status: 'active', last_login: '2026-02-16T08:00:00Z' },
  { id: '3', name: 'Neha Gupta', email: 'neha@fastship.in', role: 'viewer', status: 'active', last_login: '2026-02-15T16:00:00Z' },
  { id: '4', name: 'Sanjay Mehta', email: 'sanjay@fastship.in', role: 'accountant', status: 'inactive', last_login: '2026-01-10T09:00:00Z' },
];

export const mockMonthlyRecovery = [
  { month: 'Sep', recovered: 120000, disputes: 85, resolved: 62 },
  { month: 'Oct', recovered: 155000, disputes: 92, resolved: 71 },
  { month: 'Nov', recovered: 180000, disputes: 98, resolved: 78 },
  { month: 'Dec', recovered: 210000, disputes: 110, resolved: 88 },
  { month: 'Jan', recovered: 245000, disputes: 125, resolved: 95 },
  { month: 'Feb', recovered: 285000, disputes: 140, resolved: 108 },
];

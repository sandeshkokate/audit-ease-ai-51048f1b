// Mock data for development before Supabase is connected

export const mockTenants = [
  { id: '1', name: 'FastShip Logistics', email: 'admin@fastship.in', status: 'active', commission: 12, credit_balance: 15000, orders_processed: 4520, total_recovered: 230000, onboarding_date: '2025-06-15', slug: 'fastship', is_active: true, created_at: '2025-06-15' },
  { id: '2', name: 'QuickDeliver India', email: 'ops@quickdeliver.in', status: 'active', commission: 10, credit_balance: 8500, orders_processed: 3200, total_recovered: 180000, onboarding_date: '2025-07-01', slug: 'quickdeliver', is_active: true, created_at: '2025-07-01' },
  { id: '3', name: 'EcomShip Solutions', email: 'hello@ecomship.co', status: 'pending', commission: 15, credit_balance: 0, orders_processed: 0, total_recovered: 0, onboarding_date: '2026-02-10', slug: 'ecomship', is_active: false, created_at: '2026-02-10' },
  { id: '4', name: 'ShipSmart Pvt Ltd', email: 'team@shipsmart.in', status: 'active', commission: 8, credit_balance: 25000, orders_processed: 8900, total_recovered: 560000, onboarding_date: '2025-04-20', slug: 'shipsmart', is_active: true, created_at: '2025-04-20' },
  { id: '5', name: 'PackRight Express', email: 'support@packright.in', status: 'suspended', commission: 12, credit_balance: -2000, orders_processed: 1200, total_recovered: 45000, onboarding_date: '2025-09-01', slug: 'packright', is_active: false, created_at: '2025-09-01' },
  { id: '6', name: 'DesiCart Fulfillment', email: 'ops@desicart.in', status: 'active', commission: 11, credit_balance: 12000, orders_processed: 6700, total_recovered: 320000, onboarding_date: '2025-05-10', slug: 'desicart', is_active: true, created_at: '2025-05-10' },
];

export const mockUsers = [
  { id: '1', full_name: 'Rajesh Kumar', email: 'rajesh@fastship.in', role: 'tenant_admin', tenant_name: 'FastShip Logistics', status: 'active', last_login: '2026-02-16T10:30:00Z' },
  { id: '2', full_name: 'Priya Sharma', email: 'priya@quickdeliver.in', role: 'tenant_admin', tenant_name: 'QuickDeliver India', status: 'active', last_login: '2026-02-15T14:20:00Z' },
  { id: '3', full_name: 'Amit Patel', email: 'amit@fastship.in', role: 'accountant', tenant_name: 'FastShip Logistics', status: 'active', last_login: '2026-02-16T08:00:00Z' },
  { id: '4', full_name: 'Sneha Reddy', email: 'sneha@shipsmart.in', role: 'tenant_admin', tenant_name: 'ShipSmart Pvt Ltd', status: 'active', last_login: '2026-02-14T16:45:00Z' },
  { id: '5', full_name: 'Vikram Singh', email: 'vikram@desicart.in', role: 'viewer', tenant_name: 'DesiCart Fulfillment', status: 'inactive', last_login: '2026-01-20T09:00:00Z' },
  { id: '6', full_name: 'Admin User', email: 'admin@auditease.in', role: 'platform_admin', tenant_name: '—', status: 'active', last_login: '2026-02-16T12:00:00Z' },
];

export const mockActivityLogs = Array.from({ length: 60 }, (_, i) => ({
  id: String(i + 1),
  time: new Date(Date.now() - i * 1800000).toISOString(),
  tenant: ['FastShip Logistics', 'QuickDeliver India', 'ShipSmart Pvt Ltd', 'DesiCart Fulfillment'][i % 4],
  user: ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy'][i % 4],
  action: [
    'Uploaded billing CSV',
    'Sent dispute email to Delhivery',
    'Matched credit note #CN-4521',
    'Updated company settings',
    'Generated monthly report',
    'Added team member',
    'Approved recovery ₹12,500',
    'Changed commission rate',
  ][i % 8],
}));

export const mockTenantGrowth = [
  { month: 'Mar', count: 12 }, { month: 'Apr', count: 18 }, { month: 'May', count: 25 },
  { month: 'Jun', count: 31 }, { month: 'Jul', count: 38 }, { month: 'Aug', count: 42 },
  { month: 'Sep', count: 48 }, { month: 'Oct', count: 55 }, { month: 'Nov', count: 60 },
  { month: 'Dec', count: 68 }, { month: 'Jan', count: 74 }, { month: 'Feb', count: 82 },
];

export const mockRevenueByMonth = [
  { month: 'Mar', revenue: 120000 }, { month: 'Apr', revenue: 185000 }, { month: 'May', revenue: 240000 },
  { month: 'Jun', revenue: 310000 }, { month: 'Jul', revenue: 280000 }, { month: 'Aug', revenue: 350000 },
  { month: 'Sep', revenue: 420000 }, { month: 'Oct', revenue: 480000 }, { month: 'Nov', revenue: 510000 },
  { month: 'Dec', revenue: 560000 }, { month: 'Jan', revenue: 620000 }, { month: 'Feb', revenue: 690000 },
];

export const mockFeatureFlags = [
  { id: '1', name: 'ai_dispute_generation', label: 'AI Dispute Email Generation', enabled: true, description: 'Use AI to generate dispute emails automatically' },
  { id: '2', name: 'multi_courier_upload', label: 'Multi-Courier Upload', enabled: true, description: 'Allow uploading CSVs for multiple couriers at once' },
  { id: '3', name: 'auto_credit_matching', label: 'Auto Credit Note Matching', enabled: false, description: 'Automatically match credit notes with disputes' },
  { id: '4', name: 'whatsapp_notifications', label: 'WhatsApp Notifications', enabled: false, description: 'Send dispute notifications via WhatsApp' },
  { id: '5', name: 'advanced_analytics', label: 'Advanced Analytics Dashboard', enabled: true, description: 'Show advanced analytics with predictive insights' },
  { id: '6', name: 'bulk_dispute', label: 'Bulk Dispute Actions', enabled: true, description: 'Allow batch processing of dispute emails' },
];

export const mockDiscrepancyTypes = [
  { name: 'Weight', value: 45 },
  { name: 'Zone', value: 25 },
  { name: 'RTO', value: 18 },
  { name: 'COD', value: 8 },
  { name: 'Other', value: 4 },
];

export const mockCourierAnalysis = [
  { courier: 'Delhivery', shipments: 12500, discrepancy_rate: 14.2, avg_overcharge: 28 },
  { courier: 'BlueDart', shipments: 8900, discrepancy_rate: 11.5, avg_overcharge: 35 },
  { courier: 'DTDC', shipments: 6700, discrepancy_rate: 18.3, avg_overcharge: 22 },
  { courier: 'Ecom Express', shipments: 5400, discrepancy_rate: 12.8, avg_overcharge: 31 },
  { courier: 'Shadowfax', shipments: 4200, discrepancy_rate: 9.6, avg_overcharge: 19 },
  { courier: 'Xpressbees', shipments: 3800, discrepancy_rate: 16.1, avg_overcharge: 26 },
];

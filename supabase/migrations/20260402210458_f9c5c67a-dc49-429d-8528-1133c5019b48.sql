DELETE FROM audit_logs WHERE tenant_id = 'a1111111-1111-1111-1111-111111111111' AND order_id LIKE 'TEST-%';
DELETE FROM audit_logs WHERE tenant_id = 'a1111111-1111-1111-1111-111111111111' AND order_id LIKE 'DEBUG-%';
DELETE FROM upload_batches WHERE tenant_id = 'a1111111-1111-1111-1111-111111111111' AND filename = 'test_discrepancies.csv';
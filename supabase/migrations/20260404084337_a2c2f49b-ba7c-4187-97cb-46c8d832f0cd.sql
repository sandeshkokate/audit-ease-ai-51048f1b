
-- Deactivate the older duplicate Delhivery rate card for QuickStyle Retail
UPDATE rate_cards SET is_active = false, updated_at = now() WHERE id = 'e486ed9c-d7af-44f1-8660-fbe7661d5e00';

-- Add a unique partial index to prevent multiple active rate cards per courier per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_rate_card_per_courier
ON rate_cards (tenant_id, courier_name)
WHERE is_active = true;

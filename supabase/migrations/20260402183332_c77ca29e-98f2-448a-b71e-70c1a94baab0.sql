CREATE OR REPLACE FUNCTION public.process_csv_upload(
  p_tenant_id TEXT,
  p_uploaded_by TEXT,
  p_shipments JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shipment JSONB;
  v_courier TEXT;
  v_awb TEXT;
  v_order_id TEXT;
  v_dead_weight NUMERIC;
  v_length NUMERIC;
  v_breadth NUMERIC;
  v_height NUMERIC;
  v_volumetric_weight NUMERIC;
  v_charged_weight NUMERIC;
  v_billed_amount NUMERIC;
  v_charged_zone TEXT;
  v_expected_zone TEXT;
  v_shipment_status TEXT;
  v_is_rto BOOLEAN;
  v_origin_city TEXT;
  v_origin_state TEXT;
  v_origin_pincode TEXT;
  v_dest_city TEXT;
  v_dest_state TEXT;
  v_dest_pincode TEXT;
  v_order_date DATE;
  v_delivery_date DATE;
  v_box_count INT;
  v_cod_amount NUMERIC;
  v_rto_charge NUMERIC;
  v_payment_mode TEXT;

  -- Rate card
  v_rate_structure JSONB;
  v_rto_percentage NUMERIC;
  v_divisor INT;
  v_min_chargeable NUMERIC;

  -- Calculated
  v_max_expected_weight NUMERIC;
  v_expected_amount NUMERIC;
  v_discrepancy_amount NUMERIC;
  v_has_weight_disc BOOLEAN;
  v_has_zone_disc BOOLEAN;
  v_has_rto_overcharge BOOLEAN;
  v_disc_reasons JSONB;
  v_dispute_status TEXT;

  v_processed INT := 0;
  v_discrepancies INT := 0;
  v_failed INT := 0;
  v_audit_id UUID;
  v_upload_batch_id UUID;
BEGIN
  -- Loop through every shipment row from the CSV
  FOR v_shipment IN SELECT * FROM jsonb_array_elements(p_shipments)
  LOOP
    BEGIN
      v_awb := COALESCE(v_shipment->>'awb_number', v_shipment->>'awb', '');
      v_order_id := COALESCE(v_shipment->>'order_id', '');
      v_courier := COALESCE(v_shipment->>'courier', v_shipment->>'courier_name', '');

      -- Skip rows with no order_id (required field)
      IF v_order_id = '' THEN
        v_failed := v_failed + 1;
        CONTINUE;
      END IF;

      -- Parse numeric fields safely
      v_dead_weight := COALESCE(NULLIF(v_shipment->>'dead_weight', '')::NUMERIC, 0);
      v_length := COALESCE(NULLIF(v_shipment->>'length', '')::NUMERIC, 0);
      v_breadth := COALESCE(NULLIF(COALESCE(v_shipment->>'width', v_shipment->>'breadth'), '')::NUMERIC, 0);
      v_height := COALESCE(NULLIF(v_shipment->>'height', '')::NUMERIC, 0);
      v_charged_weight := COALESCE(NULLIF(v_shipment->>'charged_weight', '')::NUMERIC, 0);
      v_billed_amount := COALESCE(NULLIF(v_shipment->>'billed_amount', '')::NUMERIC, 0);
      v_cod_amount := COALESCE(NULLIF(v_shipment->>'cod_amount', '')::NUMERIC, 0);
      v_rto_charge := COALESCE(NULLIF(v_shipment->>'rto_charge', '')::NUMERIC, 0);
      v_charged_zone := COALESCE(v_shipment->>'charged_zone', '');
      v_shipment_status := LOWER(COALESCE(v_shipment->>'shipment_status', 'delivered'));
      v_payment_mode := LOWER(COALESCE(v_shipment->>'payment_mode', 'prepaid'));

      -- Location fields
      v_origin_city := v_shipment->>'origin_city';
      v_origin_state := v_shipment->>'origin_state';
      v_origin_pincode := v_shipment->>'origin_pincode';
      v_dest_city := v_shipment->>'destination_city';
      v_dest_state := v_shipment->>'destination_state';
      v_dest_pincode := COALESCE(v_shipment->>'destination_pincode', v_shipment->>'customer_pincode');

      -- Dates
      v_order_date := NULLIF(COALESCE(v_shipment->>'shipment_date', v_shipment->>'order_date'), '')::DATE;
      v_delivery_date := NULLIF(v_shipment->>'delivery_date', '')::DATE;

      -- RTO detection
      v_is_rto := (v_shipment_status IN ('rto', 'return', 'returned'))
                  OR COALESCE(LOWER(v_shipment->>'is_rto'), 'no') IN ('yes', 'true', '1')
                  OR v_rto_charge > 0;

      v_box_count := COALESCE(NULLIF(v_shipment->>'box_count', '')::INT, 1);

      -- Get rate card for this courier
      v_rate_structure := NULL;
      v_rto_percentage := 70;
      v_divisor := 5000;
      v_min_chargeable := 0.5;

      SELECT rate_structure, rto_percentage, divisor, min_chargeable_weight
      INTO v_rate_structure, v_rto_percentage, v_divisor, v_min_chargeable
      FROM rate_cards
      WHERE tenant_id = p_tenant_id::UUID
        AND courier_name = v_courier
        AND is_active = true
      ORDER BY effective_from DESC
      LIMIT 1;

      -- Calculate volumetric weight
      IF v_length > 0 AND v_breadth > 0 AND v_height > 0 AND v_divisor > 0 THEN
        v_volumetric_weight := (v_length * v_breadth * v_height) / v_divisor;
      ELSE
        v_volumetric_weight := 0;
      END IF;

      -- Max expected weight = max(dead_weight, volumetric_weight)
      v_max_expected_weight := GREATEST(v_dead_weight, v_volumetric_weight);
      IF v_min_chargeable > 0 THEN
        v_max_expected_weight := GREATEST(v_max_expected_weight, v_min_chargeable);
      END IF;

      -- ========== DISCREPANCY CHECKS ==========
      v_has_weight_disc := FALSE;
      v_has_zone_disc := FALSE;
      v_has_rto_overcharge := FALSE;
      v_disc_reasons := '[]'::JSONB;
      v_expected_amount := v_billed_amount;
      v_discrepancy_amount := 0;
      v_dispute_status := 'no_issue';
      v_expected_zone := v_charged_zone;

      -- CHECK 1: Weight discrepancy (0.5kg tolerance)
      IF v_charged_weight > 0 AND v_max_expected_weight > 0
         AND (v_charged_weight - v_max_expected_weight) > 0.5 THEN
        v_has_weight_disc := TRUE;
        v_disc_reasons := v_disc_reasons || jsonb_build_array(
          jsonb_build_object(
            'type', 'weight_mismatch',
            'detail', format('Charged %.2fkg vs expected %.2fkg (%.2fkg over)',
              v_charged_weight, v_max_expected_weight,
              v_charged_weight - v_max_expected_weight)
          )
        );
      END IF;

      -- CHECK 2: Zone discrepancy (if we have pincode data and zone mapping)
      IF v_origin_pincode IS NOT NULL AND v_dest_pincode IS NOT NULL AND v_charged_zone != '' THEN
        -- Try to resolve expected zone from zone_mapping or zone_master
        SELECT zm.zone_code INTO v_expected_zone
        FROM zone_mapping zm
        WHERE zm.tenant_id = p_tenant_id::UUID
          AND zm.source_pincode = v_origin_pincode
          AND zm.destination_pincode = v_dest_pincode
        LIMIT 1;

        IF v_expected_zone IS NOT NULL AND UPPER(v_expected_zone) != UPPER(v_charged_zone) THEN
          v_has_zone_disc := TRUE;
          v_disc_reasons := v_disc_reasons || jsonb_build_array(
            jsonb_build_object(
              'type', 'zone_mismatch',
              'detail', format('Charged zone %s vs expected zone %s',
                v_charged_zone, v_expected_zone)
            )
          );
        END IF;
      END IF;

      -- CHECK 3: RTO overcharge
      IF v_is_rto AND v_rto_charge > 0 AND v_rate_structure IS NOT NULL THEN
        DECLARE
          v_expected_rto NUMERIC;
          v_forward_amount NUMERIC;
        BEGIN
          v_forward_amount := v_billed_amount - v_rto_charge;
          IF v_forward_amount > 0 THEN
            v_expected_rto := v_forward_amount * (COALESCE(v_rto_percentage, 70) / 100.0);
            IF (v_rto_charge - v_expected_rto) > 10 THEN
              v_has_rto_overcharge := TRUE;
              v_disc_reasons := v_disc_reasons || jsonb_build_array(
                jsonb_build_object(
                  'type', 'rto_overcharge',
                  'detail', format('RTO charged ₹%.2f vs expected ₹%.2f (%.0f%% of forward)',
                    v_rto_charge, v_expected_rto, v_rto_percentage)
                )
              );
            END IF;
          END IF;
        END;
      END IF;

      -- Calculate expected amount and discrepancy
      IF v_has_weight_disc OR v_has_zone_disc OR v_has_rto_overcharge THEN
        -- Simple estimation: ratio-based
        IF v_has_weight_disc AND v_charged_weight > 0 THEN
          v_expected_amount := v_billed_amount * (v_max_expected_weight / v_charged_weight);
        END IF;
        v_discrepancy_amount := GREATEST(v_billed_amount - v_expected_amount, 0);
        IF v_discrepancy_amount > 0 THEN
          v_dispute_status := 'pending';
          v_discrepancies := v_discrepancies + 1;
        END IF;
      END IF;

      -- Insert into audit_logs
      INSERT INTO audit_logs (
        tenant_id, order_id, awb, courier_name,
        shipment_status, origin_city, origin_state, origin_pincode,
        destination_city, destination_state, customer_pincode,
        order_date, delivery_date,
        dead_weight, volumetric_weight, charged_weight, max_expected_weight,
        length_cm, breadth_cm, height_cm, box_count,
        charged_zone, expected_zone,
        billed_amount, expected_amount, discrepancy_amount,
        is_rto, has_weight_discrepancy, has_zone_discrepancy,
        has_rto_overcharge, has_damage_misclassification,
        discrepancy_reasons, dispute_status,
        created_by, created_at, updated_at
      ) VALUES (
        p_tenant_id::UUID, v_order_id, NULLIF(v_awb, ''), v_courier,
        v_shipment_status, v_origin_city, v_origin_state, v_origin_pincode,
        v_dest_city, v_dest_state, v_dest_pincode,
        v_order_date, v_delivery_date,
        v_dead_weight, v_volumetric_weight, v_charged_weight, v_max_expected_weight,
        v_length, v_breadth, v_height, v_box_count,
        v_charged_zone, v_expected_zone,
        v_billed_amount, v_expected_amount, v_discrepancy_amount,
        v_is_rto, v_has_weight_disc, v_has_zone_disc,
        v_has_rto_overcharge, FALSE,
        v_disc_reasons, v_dispute_status,
        p_uploaded_by::UUID, NOW(), NOW()
      );

      v_processed := v_processed + 1;

    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed + 1;
    END;
  END LOOP;

  -- Return summary
  RETURN jsonb_build_object(
    'success', true,
    'processed', v_processed,
    'discrepancies_found', v_discrepancies,
    'failed', v_failed,
    'message', format('Processed %s shipments, found %s discrepancies, %s failed',
      v_processed, v_discrepancies, v_failed)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
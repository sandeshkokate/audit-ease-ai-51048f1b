
CREATE OR REPLACE FUNCTION public.process_csv_upload(p_tenant_id text, p_uploaded_by text, p_shipments jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  v_rate_structure JSONB;
  v_rto_percentage NUMERIC;
  v_divisor INT;
  v_min_chargeable NUMERIC;

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
  v_duplicates INT := 0;
  v_errors JSONB := '[]'::JSONB;

  v_src_prefix INT;
  v_dst_prefix INT;
  v_src_circle TEXT;
  v_dst_circle TEXT;
  v_resolved_zone TEXT;
BEGIN
  FOR v_shipment IN SELECT * FROM jsonb_array_elements(p_shipments)
  LOOP
    BEGIN
      v_awb := COALESCE(v_shipment->>'awb_number', v_shipment->>'awb', '');
      v_order_id := COALESCE(v_shipment->>'order_id', '');
      v_courier := COALESCE(v_shipment->>'courier', v_shipment->>'courier_name', '');

      IF v_order_id = '' THEN
        v_failed := v_failed + 1;
        v_errors := v_errors || jsonb_build_array(jsonb_build_object('order_id', v_order_id, 'error', 'Missing order_id'));
        CONTINUE;
      END IF;

      IF EXISTS (
        SELECT 1 FROM audit_logs
        WHERE tenant_id = p_tenant_id::UUID
          AND order_id = v_order_id
          AND COALESCE(awb, '') = COALESCE(NULLIF(v_awb, ''), '')
      ) THEN
        v_duplicates := v_duplicates + 1;
        CONTINUE;
      END IF;

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

      v_origin_city := v_shipment->>'origin_city';
      v_origin_state := v_shipment->>'origin_state';
      v_origin_pincode := COALESCE(v_shipment->>'origin_pincode', v_shipment->>'pickup_pincode', v_shipment->>'sender_pincode');
      v_dest_city := v_shipment->>'destination_city';
      v_dest_state := v_shipment->>'destination_state';
      v_dest_pincode := COALESCE(v_shipment->>'destination_pincode', v_shipment->>'customer_pincode', v_shipment->>'delivery_pincode');

      v_order_date := NULLIF(COALESCE(v_shipment->>'shipment_date', v_shipment->>'order_date'), '')::DATE;
      v_delivery_date := NULLIF(v_shipment->>'delivery_date', '')::DATE;

      v_is_rto := (v_shipment_status IN ('rto', 'return', 'returned'))
                  OR COALESCE(LOWER(v_shipment->>'is_rto'), 'no') IN ('yes', 'true', '1')
                  OR v_rto_charge > 0;

      v_box_count := COALESCE(NULLIF(v_shipment->>'box_count', '')::INT, 1);

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

      v_rto_percentage := COALESCE(v_rto_percentage, 70);
      v_divisor := COALESCE(v_divisor, 5000);
      v_min_chargeable := COALESCE(v_min_chargeable, 0.5);

      IF v_length > 0 AND v_breadth > 0 AND v_height > 0 AND v_divisor > 0 THEN
        v_volumetric_weight := (v_length * v_breadth * v_height) / v_divisor;
      ELSE
        v_volumetric_weight := 0;
      END IF;

      v_max_expected_weight := GREATEST(v_dead_weight, v_volumetric_weight);
      IF v_min_chargeable > 0 THEN
        v_max_expected_weight := GREATEST(v_max_expected_weight, v_min_chargeable);
      END IF;

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
            'detail', 'Charged ' || ROUND(v_charged_weight, 2) || 'kg vs expected ' || ROUND(v_max_expected_weight, 2) || 'kg (' || ROUND(v_charged_weight - v_max_expected_weight, 2) || 'kg over)'
          )
        );
      END IF;

      -- CHECK 2: Zone discrepancy
      v_resolved_zone := NULL;
      IF v_origin_pincode IS NOT NULL AND v_dest_pincode IS NOT NULL AND v_charged_zone != '' THEN
        SELECT zm.zone_code INTO v_resolved_zone
        FROM zone_mapping zm
        WHERE zm.tenant_id = p_tenant_id::UUID
          AND zm.source_pincode = v_origin_pincode
          AND zm.destination_pincode = v_dest_pincode
        LIMIT 1;

        IF v_resolved_zone IS NULL THEN
          BEGIN
            v_src_prefix := SUBSTRING(REGEXP_REPLACE(v_origin_pincode, '[^0-9]', '', 'g'), 1, 6)::INTEGER / 1000;
            v_dst_prefix := SUBSTRING(REGEXP_REPLACE(v_dest_pincode, '[^0-9]', '', 'g'), 1, 6)::INTEGER / 1000;

            SELECT circle INTO v_src_circle
            FROM pincode_circle_map
            WHERE v_src_prefix BETWEEN prefix_start AND prefix_end
            ORDER BY prefix_start DESC LIMIT 1;

            SELECT circle INTO v_dst_circle
            FROM pincode_circle_map
            WHERE v_dst_prefix BETWEEN prefix_start AND prefix_end
            ORDER BY prefix_start DESC LIMIT 1;

            IF v_src_circle IS NOT NULL AND v_dst_circle IS NOT NULL THEN
              IF v_origin_pincode = v_dest_pincode THEN
                v_resolved_zone := 'Within';
              ELSE
                SELECT zcm.zone_code INTO v_resolved_zone
                FROM zone_circle_matrix zcm
                WHERE zcm.origin_circle = v_src_circle
                  AND zcm.destination_circle = v_dst_circle;
              END IF;
            END IF;
          EXCEPTION WHEN OTHERS THEN
            v_resolved_zone := NULL;
          END;
        END IF;

        IF v_resolved_zone IS NOT NULL THEN
          v_expected_zone := v_resolved_zone;
          IF UPPER(v_resolved_zone) != UPPER(v_charged_zone) THEN
            v_has_zone_disc := TRUE;
            v_disc_reasons := v_disc_reasons || jsonb_build_array(
              jsonb_build_object(
                'type', 'zone_mismatch',
                'detail', 'Charged zone ' || v_charged_zone || ' vs expected zone ' || v_resolved_zone
              )
            );
          END IF;
        END IF;
      END IF;

      -- CHECK 3: RTO overcharge
      IF v_is_rto AND v_rto_charge > 0 THEN
        DECLARE
          v_expected_rto NUMERIC;
          v_forward_amount NUMERIC;
        BEGIN
          v_forward_amount := v_billed_amount - v_rto_charge;
          IF v_forward_amount > 0 THEN
            v_expected_rto := v_forward_amount * (v_rto_percentage / 100.0);
            IF (v_rto_charge - v_expected_rto) > 10 THEN
              v_has_rto_overcharge := TRUE;
              v_disc_reasons := v_disc_reasons || jsonb_build_array(
                jsonb_build_object(
                  'type', 'rto_overcharge',
                  'detail', 'RTO charged ' || ROUND(v_rto_charge, 2) || ' vs expected ' || ROUND(v_expected_rto, 2) || ' (' || ROUND(v_rto_percentage, 0) || '% of forward)'
                )
              );
            END IF;
          END IF;
        END;
      END IF;

      -- Calculate expected amount and discrepancy
      IF v_has_weight_disc OR v_has_zone_disc OR v_has_rto_overcharge THEN
        v_expected_amount := v_billed_amount;

        -- Weight discrepancy: use rate card to calculate correct amount if available
        IF v_has_weight_disc THEN
          IF v_rate_structure IS NOT NULL AND v_charged_weight > 0 THEN
            -- Try to find rate for current zone and expected weight from rate card
            DECLARE
              v_zone_key TEXT;
              v_zone_rates JSONB;
              v_slab_key TEXT;
              v_slab_rate NUMERIC;
              v_charged_rate NUMERIC;
              v_expected_rate NUMERIC;
              v_wt_lower NUMERIC;
              v_wt_upper NUMERIC;
            BEGIN
              v_zone_key := COALESCE(v_expected_zone, v_charged_zone);
              v_zone_rates := v_rate_structure->v_zone_key;
              
              IF v_zone_rates IS NOT NULL THEN
                -- Find rate for expected weight slab
                v_expected_rate := NULL;
                v_charged_rate := NULL;
                FOR v_slab_key IN SELECT jsonb_object_keys(v_zone_rates)
                LOOP
                  v_wt_lower := SPLIT_PART(v_slab_key, '-', 1)::NUMERIC;
                  v_wt_upper := SPLIT_PART(v_slab_key, '-', 2)::NUMERIC;
                  IF v_max_expected_weight > v_wt_lower AND v_max_expected_weight <= v_wt_upper THEN
                    v_expected_rate := (v_zone_rates->>v_slab_key)::NUMERIC;
                  END IF;
                  IF v_charged_weight > v_wt_lower AND v_charged_weight <= v_wt_upper THEN
                    v_charged_rate := (v_zone_rates->>v_slab_key)::NUMERIC;
                  END IF;
                END LOOP;
                
                IF v_expected_rate IS NOT NULL AND v_charged_rate IS NOT NULL AND v_charged_rate > 0 THEN
                  v_expected_amount := ROUND(v_billed_amount * (v_expected_rate / v_charged_rate), 2);
                ELSE
                  -- Fallback: proportional scaling
                  v_expected_amount := ROUND(v_billed_amount * (v_max_expected_weight / v_charged_weight), 2);
                END IF;
              ELSE
                -- No zone rates, fallback to proportional scaling
                v_expected_amount := ROUND(v_billed_amount * (v_max_expected_weight / v_charged_weight), 2);
              END IF;
            END;
          ELSE
            -- No rate card at all, proportional scaling
            IF v_charged_weight > 0 THEN
              v_expected_amount := ROUND(v_billed_amount * (v_max_expected_weight / v_charged_weight), 2);
            END IF;
          END IF;
        END IF;

        -- Zone discrepancy: use rate card zone rates to calculate exact difference
        IF v_has_zone_disc AND NOT v_has_weight_disc THEN
          IF v_rate_structure IS NOT NULL THEN
            DECLARE
              v_charged_zone_rates JSONB;
              v_expected_zone_rates JSONB;
              v_charged_zone_rate NUMERIC;
              v_expected_zone_rate NUMERIC;
              v_sk TEXT;
              v_wl NUMERIC;
              v_wu NUMERIC;
              v_lookup_weight NUMERIC;
            BEGIN
              v_charged_zone_rates := v_rate_structure->v_charged_zone;
              v_expected_zone_rates := v_rate_structure->v_expected_zone;
              v_lookup_weight := COALESCE(v_max_expected_weight, v_charged_weight);
              v_charged_zone_rate := NULL;
              v_expected_zone_rate := NULL;

              -- Find rate for charged zone at this weight
              IF v_charged_zone_rates IS NOT NULL THEN
                FOR v_sk IN SELECT jsonb_object_keys(v_charged_zone_rates)
                LOOP
                  v_wl := SPLIT_PART(v_sk, '-', 1)::NUMERIC;
                  v_wu := SPLIT_PART(v_sk, '-', 2)::NUMERIC;
                  IF v_lookup_weight > v_wl AND v_lookup_weight <= v_wu THEN
                    v_charged_zone_rate := (v_charged_zone_rates->>v_sk)::NUMERIC;
                  END IF;
                END LOOP;
              END IF;

              -- Find rate for expected zone at this weight
              IF v_expected_zone_rates IS NOT NULL THEN
                FOR v_sk IN SELECT jsonb_object_keys(v_expected_zone_rates)
                LOOP
                  v_wl := SPLIT_PART(v_sk, '-', 1)::NUMERIC;
                  v_wu := SPLIT_PART(v_sk, '-', 2)::NUMERIC;
                  IF v_lookup_weight > v_wl AND v_lookup_weight <= v_wu THEN
                    v_expected_zone_rate := (v_expected_zone_rates->>v_sk)::NUMERIC;
                  END IF;
                END LOOP;
              END IF;

              -- If we have both rates, calculate exact difference
              IF v_charged_zone_rate IS NOT NULL AND v_expected_zone_rate IS NOT NULL AND v_charged_zone_rate > 0 THEN
                v_expected_amount := ROUND(v_billed_amount * (v_expected_zone_rate / v_charged_zone_rate), 2);
              ELSE
                -- Fallback: one or both zones not in rate card, use 10% estimate
                v_expected_amount := ROUND(v_billed_amount * 0.90, 2);
              END IF;
            END;
          ELSE
            -- No rate card at all, use 10% estimate
            v_expected_amount := ROUND(v_billed_amount * 0.90, 2);
          END IF;
        END IF;

        -- RTO overcharge: deduct the RTO excess
        IF v_has_rto_overcharge AND v_rto_charge > 0 THEN
          DECLARE
            v_fwd NUMERIC;
            v_exp_rto NUMERIC;
            v_rto_excess NUMERIC;
          BEGIN
            v_fwd := v_billed_amount - v_rto_charge;
            IF v_fwd > 0 THEN
              v_exp_rto := v_fwd * (v_rto_percentage / 100.0);
              v_rto_excess := v_rto_charge - v_exp_rto;
              IF v_rto_excess > 0 THEN
                v_expected_amount := ROUND(v_expected_amount - v_rto_excess, 2);
              END IF;
            END IF;
          END;
        END IF;

        v_discrepancy_amount := GREATEST(ROUND(v_billed_amount - v_expected_amount, 2), 0);

        -- Only flag as discrepancy if there's meaningful financial impact (> ₹1)
        IF v_discrepancy_amount > 1 THEN
          v_dispute_status := 'pending';
          v_discrepancies := v_discrepancies + 1;
        ELSE
          v_has_weight_disc := FALSE;
          v_has_zone_disc := FALSE;
          v_has_rto_overcharge := FALSE;
          v_disc_reasons := '[]'::JSONB;
          v_discrepancy_amount := 0;
          v_expected_amount := v_billed_amount;
          v_expected_zone := v_charged_zone;
          v_dispute_status := 'no_issue';
        END IF;
      END IF;

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
      v_errors := v_errors || jsonb_build_array(jsonb_build_object('order_id', v_order_id, 'awb', v_awb, 'error', SQLERRM));
    END;
  END LOOP;

  -- Notify tenant users
  BEGIN
    PERFORM notify_tenant_users(
      p_tenant_id := p_tenant_id::UUID,
      p_title := 'CSV upload completed',
      p_message := 'File processed: ' || v_processed || ' rows, ' || v_discrepancies || ' discrepancies found.',
      p_type := CASE WHEN v_discrepancies > 0 THEN 'warning' ELSE 'success' END,
      p_link := '/tenant/upload-history'
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'processed', v_processed,
    'discrepancies_found', v_discrepancies,
    'failed', v_failed,
    'duplicates_skipped', v_duplicates,
    'errors', v_errors,
    'message', 'Processed ' || v_processed || ' shipments, found ' || v_discrepancies || ' discrepancies, ' || v_failed || ' failed, ' || v_duplicates || ' duplicates skipped'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;

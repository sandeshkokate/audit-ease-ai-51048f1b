
CREATE OR REPLACE FUNCTION public.process_csv_upload(p_tenant_id uuid, p_uploaded_by uuid, p_shipments jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_shipment JSONB;
  v_rate_card RECORD;
  v_shipment_id UUID;
  v_processed INT := 0;
  v_discrepancies INT := 0;
  v_errors JSONB := '[]'::JSONB;
  
  -- Shipment data
  v_awb TEXT;
  v_courier TEXT;
  v_status TEXT;
  v_billed_zone TEXT;
  
  -- Weight data
  v_actual_weight NUMERIC;
  v_billed_weight NUMERIC;
  v_length NUMERIC;
  v_width NUMERIC;
  v_height NUMERIC;
  v_volumetric_weight NUMERIC;
  v_expected_weight NUMERIC;
  
  -- Charge data
  v_forward_charge NUMERIC;
  v_fuel_surcharge NUMERIC;
  v_cod_charge NUMERIC;
  v_rto_charge NUMERIC;
  v_billed_amount NUMERIC;
  
  -- Calculation variables
  v_weight_slab_rate NUMERIC;
  v_zone_multiplier NUMERIC;
  v_expected_forward NUMERIC;
  v_expected_rto NUMERIC;
  v_overcharge NUMERIC;
  v_expected_zone TEXT;
  v_weight_discrepancy_found BOOLEAN;
  
BEGIN
  FOR v_shipment IN SELECT * FROM jsonb_array_elements(p_shipments)
  LOOP
    BEGIN
      -- Extract data from JSON
      v_awb := v_shipment->>'awb_number';
      v_courier := v_shipment->>'courier';
      v_status := UPPER(TRIM(COALESCE(v_shipment->>'status', 'DELIVERED')));
      v_billed_zone := UPPER(TRIM(COALESCE(v_shipment->>'billed_zone', '')));
      
      v_actual_weight := COALESCE((v_shipment->>'actual_weight')::NUMERIC, 0);
      v_billed_weight := COALESCE((v_shipment->>'billed_weight')::NUMERIC, 0);
      v_length := COALESCE((v_shipment->>'length')::NUMERIC, 0);
      v_width := COALESCE((v_shipment->>'width')::NUMERIC, 0);
      v_height := COALESCE((v_shipment->>'height')::NUMERIC, 0);
      
      v_forward_charge := COALESCE((v_shipment->>'forward_charge')::NUMERIC, 0);
      v_fuel_surcharge := COALESCE((v_shipment->>'fuel_surcharge')::NUMERIC, 0);
      v_cod_charge := COALESCE((v_shipment->>'cod_charge')::NUMERIC, 0);
      v_rto_charge := COALESCE((v_shipment->>'rto_charge')::NUMERIC, 0);
      v_billed_amount := COALESCE((v_shipment->>'billed_amount')::NUMERIC, 0);
      
      -- Get rate card
      SELECT 
        rate_structure,
        rto_percentage,
        COALESCE((rate_structure->>'base_rate')::NUMERIC, 0) as base_rate,
        COALESCE((rate_structure->>'fuel_surcharge_pct')::NUMERIC, 0) as fuel_surcharge_pct,
        COALESCE((rate_structure->>'min_weight')::NUMERIC, 0.5) as min_weight,
        COALESCE((rate_structure->>'volumetric_divisor')::NUMERIC, 5000) as volumetric_divisor
      INTO v_rate_card
      FROM rate_cards
      WHERE tenant_id = p_tenant_id
        AND LOWER(courier) = LOWER(v_courier)
        AND is_active = true
      LIMIT 1;
      
      IF v_rate_card IS NULL THEN
        v_processed := v_processed + 1;
        CONTINUE;
      END IF;
      
      -- Calculate volumetric weight
      IF v_length > 0 AND v_width > 0 AND v_height > 0 THEN
        v_volumetric_weight := (v_length * v_width * v_height) / v_rate_card.volumetric_divisor;
      ELSE
        v_volumetric_weight := 0;
      END IF;
      
      v_expected_weight := GREATEST(
        GREATEST(v_actual_weight, v_volumetric_weight),
        v_rate_card.min_weight
      );
      
      -- Insert shipment
      INSERT INTO shipments (
        tenant_id, awb_number, courier, order_id,
        actual_weight, billed_weight, volumetric_weight,
        length_cm, width_cm, height_cm,
        forward_charge, fuel_surcharge, cod_charge, rto_charge, billed_amount,
        origin_city, origin_state, destination_city, destination_state,
        billed_zone, shipment_date, status, is_rto,
        payment_mode, product_type, uploaded_by
      ) VALUES (
        p_tenant_id, v_awb, v_courier, v_shipment->>'order_id',
        v_actual_weight, v_billed_weight, v_volumetric_weight,
        v_length, v_width, v_height,
        v_forward_charge, v_fuel_surcharge, v_cod_charge, v_rto_charge, v_billed_amount,
        v_shipment->>'origin_city', v_shipment->>'origin_state',
        v_shipment->>'destination_city', v_shipment->>'destination_state',
        v_billed_zone, 
        COALESCE((v_shipment->>'shipment_date')::DATE, CURRENT_DATE),
        v_status, (v_status = 'RTO'),
        v_shipment->>'payment_mode', v_shipment->>'product_type',
        p_uploaded_by
      )
      ON CONFLICT (tenant_id, awb_number) DO UPDATE SET updated_at = NOW()
      RETURNING id INTO v_shipment_id;
      
      v_weight_discrepancy_found := FALSE;
      
      -- ========== CHECK 1: WEIGHT DISCREPANCY ==========
      -- Fires when billed weight is significantly higher than expected weight
      IF (v_billed_weight - v_expected_weight) > 0.5 THEN
        v_weight_discrepancy_found := TRUE;
        
        SELECT COALESCE((slab->>'rate')::NUMERIC, 0) INTO v_weight_slab_rate
        FROM jsonb_array_elements(v_rate_card.rate_structure->'weight_slabs') AS slab
        WHERE (slab->>'min_weight')::NUMERIC <= v_expected_weight
          AND (slab->>'max_weight')::NUMERIC >= v_expected_weight
        LIMIT 1;
        
        v_zone_multiplier := COALESCE(
          (v_rate_card.rate_structure->'zone_multipliers'->>v_billed_zone)::NUMERIC, 1.0
        );
        
        v_expected_forward := (v_rate_card.base_rate + COALESCE(v_weight_slab_rate, 0)) 
                              * v_zone_multiplier 
                              * (1 + v_rate_card.fuel_surcharge_pct / 100);
        
        v_overcharge := v_forward_charge - v_expected_forward;
        
        IF v_overcharge > 1 THEN
          INSERT INTO audit_logs (
            tenant_id, shipment_id, awb_number, courier,
            discrepancy_type, billed_value, expected_value, overcharge_amount,
            billed_weight, expected_weight, billed_zone, status
          ) VALUES (
            p_tenant_id, v_shipment_id, v_awb, v_courier,
            'weight', v_forward_charge, v_expected_forward, v_overcharge,
            v_billed_weight, v_expected_weight, v_billed_zone, 'pending'
          );
          v_discrepancies := v_discrepancies + 1;
        END IF;
      END IF;
      
      
      -- ========== CHECK 2: FORWARD CHARGE DISCREPANCY ==========
      -- Always validates forward charge against rate card, even when weight is correct
      IF NOT v_weight_discrepancy_found AND v_forward_charge > 0 AND v_billed_zone != '' THEN
        -- Use billed_weight (or expected_weight) to find the correct slab rate
        SELECT COALESCE((slab->>'rate')::NUMERIC, 0) INTO v_weight_slab_rate
        FROM jsonb_array_elements(v_rate_card.rate_structure->'weight_slabs') AS slab
        WHERE (slab->>'min_weight')::NUMERIC <= v_billed_weight
          AND (slab->>'max_weight')::NUMERIC >= v_billed_weight
        LIMIT 1;
        
        v_zone_multiplier := COALESCE(
          (v_rate_card.rate_structure->'zone_multipliers'->>v_billed_zone)::NUMERIC, 1.0
        );
        
        v_expected_forward := (v_rate_card.base_rate + COALESCE(v_weight_slab_rate, 0)) 
                              * v_zone_multiplier 
                              * (1 + v_rate_card.fuel_surcharge_pct / 100);
        
        v_overcharge := v_forward_charge - v_expected_forward;
        
        IF v_overcharge > 1 THEN
          INSERT INTO audit_logs (
            tenant_id, shipment_id, awb_number, courier,
            discrepancy_type, billed_value, expected_value, overcharge_amount,
            billed_weight, expected_weight, billed_zone, status
          ) VALUES (
            p_tenant_id, v_shipment_id, v_awb, v_courier,
            'overcharge', v_forward_charge, v_expected_forward, v_overcharge,
            v_billed_weight, v_expected_weight, v_billed_zone, 'pending'
          );
          v_discrepancies := v_discrepancies + 1;
        END IF;
      END IF;
      
      
      -- ========== CHECK 3: ZONE DISCREPANCY ==========
      SELECT zone INTO v_expected_zone
      FROM city_zone_mapping
      WHERE tenant_id = p_tenant_id
        AND LOWER(courier) = LOWER(v_courier)
        AND LOWER(origin_city) = LOWER(v_shipment->>'origin_city')
        AND LOWER(destination_city) = LOWER(v_shipment->>'destination_city')
      LIMIT 1;
      
      IF v_expected_zone IS NOT NULL AND UPPER(v_expected_zone) != v_billed_zone THEN
        DECLARE
          v_billed_zone_mult NUMERIC;
          v_expected_zone_mult NUMERIC;
        BEGIN
          v_billed_zone_mult := COALESCE(
            (v_rate_card.rate_structure->'zone_multipliers'->>v_billed_zone)::NUMERIC, 1.0
          );
          v_expected_zone_mult := COALESCE(
            (v_rate_card.rate_structure->'zone_multipliers'->>UPPER(v_expected_zone))::NUMERIC, 1.0
          );
          
          SELECT COALESCE((slab->>'rate')::NUMERIC, 0) INTO v_weight_slab_rate
          FROM jsonb_array_elements(v_rate_card.rate_structure->'weight_slabs') AS slab
          WHERE (slab->>'min_weight')::NUMERIC <= v_billed_weight
            AND (slab->>'max_weight')::NUMERIC >= v_billed_weight
          LIMIT 1;
          
          v_overcharge := (v_billed_zone_mult - v_expected_zone_mult) 
                          * (v_rate_card.base_rate + COALESCE(v_weight_slab_rate, 0))
                          * (1 + v_rate_card.fuel_surcharge_pct / 100);
          
          IF v_overcharge > 1 THEN
            INSERT INTO audit_logs (
              tenant_id, shipment_id, awb_number, courier,
              discrepancy_type, billed_value, expected_value, overcharge_amount,
              billed_zone, expected_zone, status
            ) VALUES (
              p_tenant_id, v_shipment_id, v_awb, v_courier,
              'zone', v_forward_charge, v_forward_charge - v_overcharge, v_overcharge,
              v_billed_zone, v_expected_zone, 'pending'
            );
            v_discrepancies := v_discrepancies + 1;
          END IF;
        END;
      END IF;
      
      
      -- ========== CHECK 4: RTO OVERCHARGE ==========
      IF v_status = 'RTO' AND v_forward_charge > 0 THEN
        v_expected_rto := v_forward_charge * (COALESCE(v_rate_card.rto_percentage, 50) / 100.0);
        v_overcharge := v_rto_charge - v_expected_rto;
        
        IF v_overcharge > 1 THEN
          INSERT INTO audit_logs (
            tenant_id, shipment_id, awb_number, courier,
            discrepancy_type, billed_value, expected_value, overcharge_amount,
            forward_charge, billed_rto, expected_rto, rto_percentage, status
          ) VALUES (
            p_tenant_id, v_shipment_id, v_awb, v_courier,
            'rto', v_rto_charge, v_expected_rto, v_overcharge,
            v_forward_charge, v_rto_charge, v_expected_rto, v_rate_card.rto_percentage, 'pending'
          );
          v_discrepancies := v_discrepancies + 1;
        END IF;
      END IF;
      
      v_processed := v_processed + 1;
      
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors || jsonb_build_object('awb', v_awb, 'error', SQLERRM);
      v_processed := v_processed + 1;
    END;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'processed', v_processed,
    'discrepancies_found', v_discrepancies,
    'errors', v_errors,
    'message', format('Processed %s shipments, found %s discrepancies', v_processed, v_discrepancies)
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'processed', v_processed
  );
END;
$function$;

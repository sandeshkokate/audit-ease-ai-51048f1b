export type ParsedShipmentRow = Record<string, string>;

interface LocationLookupRow {
  city: string | null;
  state: string | null;
  pincode: string;
}

const normalizeValue = (value?: string | null) => value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";

const toTitleCase = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const dedupe = <T,>(values: T[]) => Array.from(new Set(values));

export const getLocationKey = (city?: string | null, state?: string | null) => {
  const normalizedCity = normalizeValue(city);
  const normalizedState = normalizeValue(state);
  return normalizedCity && normalizedState ? `${normalizedCity}|${normalizedState}` : "";
};

export function hasRowsMissingPincodes(rows: ParsedShipmentRow[]) {
  return rows.some((row) => {
    const missingOrigin = !row.origin_pincode && row.origin_city && row.origin_state;
    const missingDestination =
      !row.destination_pincode && !row.customer_pincode && !row.delivery_pincode && row.destination_city && row.destination_state;

    return missingOrigin || missingDestination;
  });
}

export function getLocationLookupFilters(rows: ParsedShipmentRow[]) {
  const pairs = rows.flatMap((row) => [
    { city: row.origin_city, state: row.origin_state },
    { city: row.destination_city, state: row.destination_state },
  ]);

  const cities = dedupe(
    pairs
      .map((pair) => pair.city?.trim())
      .filter(Boolean)
      .flatMap((city) => dedupe([city as string, toTitleCase(city as string)])),
  );

  const states = dedupe(
    pairs
      .map((pair) => pair.state?.trim())
      .filter(Boolean)
      .flatMap((state) => dedupe([state as string, toTitleCase(state as string)])),
  );

  return { cities, states };
}

export function buildRepresentativePincodeMap(rows: LocationLookupRow[]) {
  const pincodeMap = new Map<string, string>();

  rows.forEach((row) => {
    const key = getLocationKey(row.city, row.state);
    if (key && row.pincode && !pincodeMap.has(key)) {
      pincodeMap.set(key, row.pincode);
    }
  });

  return pincodeMap;
}

export function applyPincodeLookup(rows: ParsedShipmentRow[], pincodeMap: Map<string, string>) {
  return rows.map((row) => {
    const nextRow = { ...row };

    if (!nextRow.origin_pincode) {
      const originPincode = pincodeMap.get(getLocationKey(row.origin_city, row.origin_state));
      if (originPincode) nextRow.origin_pincode = originPincode;
    }

    if (!nextRow.destination_pincode && !nextRow.customer_pincode && !nextRow.delivery_pincode) {
      const destinationPincode = pincodeMap.get(getLocationKey(row.destination_city, row.destination_state));
      if (destinationPincode) nextRow.destination_pincode = destinationPincode;
    }

    return nextRow;
  });
}
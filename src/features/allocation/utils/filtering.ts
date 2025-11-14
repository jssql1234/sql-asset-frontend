import type { AssetRecord, RentalRecord } from "../types";

const normalizeQuery = (query: string) => query.trim().toLowerCase();

export const filterAssetsByQuery = (
  assets: AssetRecord[],
  query: string
): AssetRecord[] => {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return assets;
  }

  return assets.filter((asset) => {
    const haystack = [
      asset.name,
      asset.code,
      asset.status,
      asset.location,
      asset.category,
      asset.pic,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
};

export const filterRentalsByQuery = (
  rentals: RentalRecord[],
  query: string
): RentalRecord[] => {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return rentals;
  }

  return rentals.filter((rental) => {
    const haystack = [
      rental.assetName,
      rental.customerName,
      rental.status,
      rental.location,
      rental.contactEmail,
      rental.contactPhone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
};

export interface PropertyLocationVerification {
  mode: 'standing-at-property' | 'current-location';
  latitude: number;
  longitude: number;
  gpsAccuracyMeters: number;
  humanReadableAddress?: string;
  suggestedCounty?: string;
  suggestedTown?: string;
  suggestedEstateOrArea?: string;
  nearbyRoad?: string;
  capturedAt: string;
  adjusted: boolean;
  verified: boolean;
}

export const LOCATION_ACCURACY_WARNING_THRESHOLD_METERS = 50;

export function isLocationAccuracyAcceptable(accuracyMeters: number): boolean {
  return Number.isFinite(accuracyMeters) && accuracyMeters > 0 && accuracyMeters <= LOCATION_ACCURACY_WARNING_THRESHOLD_METERS;
}

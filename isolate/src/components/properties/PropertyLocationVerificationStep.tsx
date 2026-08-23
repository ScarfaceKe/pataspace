'use client';

import { useState } from 'react';
import { LOCATION_ACCURACY_WARNING_THRESHOLD_METERS, isLocationAccuracyAcceptable, type PropertyLocationVerification } from '@/domain/location-verification';

type Mode = 'standing-at-property' | 'current-location';

interface Props {
  value?: PropertyLocationVerification;
  onChange: (verification: PropertyLocationVerification) => void;
  onSuggestedAddress?: (input: { county?: string; town?: string; estate?: string; road?: string; address?: string }) => void;
}

function parseAddress(payload: any) {
  const address = payload?.address ?? {};
  return {
    county: address.county || address.state,
    town: address.town || address.city || address.municipality || address.village,
    estate: address.suburb || address.neighbourhood || address.residential || address.quarter,
    road: address.road,
    address: payload?.display_name as string | undefined
  };
}

export function PropertyLocationVerificationStep({ value, onChange, onSuggestedAddress }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(value?.verified ? '✅ Property location verified successfully.' : '');
  const [error, setError] = useState('');

  async function reverseGeocode(latitude: number, longitude: number): Promise<{ county?: string; town?: string; estate?: string; road?: string; address?: string }> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
      if (!response.ok) return {};
      return parseAddress(await response.json());
    } catch {
      return {};
    }
  }

  async function capture(mode: Mode) {
    setLoading(true);
    setError('');
    setMessage(mode === 'standing-at-property' ? 'Getting your precise property location...' : 'Getting your current location...');
    if (!navigator.geolocation) {
      setLoading(false);
      setError('Location capture is not supported on this device or browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        if (!isLocationAccuracyAcceptable(accuracy)) {
          setError(`Your location accuracy is currently low. Move closer to the property or wait a few seconds before trying again. Current accuracy: ${Math.round(accuracy)}m.`);
        }
        const suggested = await reverseGeocode(latitude, longitude);
        const verification: PropertyLocationVerification = {
          mode,
          latitude,
          longitude,
          gpsAccuracyMeters: accuracy,
          humanReadableAddress: suggested.address,
          suggestedCounty: suggested.county,
          suggestedTown: suggested.town,
          suggestedEstateOrArea: suggested.estate,
          nearbyRoad: suggested.road,
          capturedAt: new Date().toISOString(),
          adjusted: false,
          verified: isLocationAccuracyAcceptable(accuracy)
        };
        onChange(verification);
        onSuggestedAddress?.(suggested);
        setMessage(isLocationAccuracyAcceptable(accuracy) ? '✅ Property location verified successfully.' : 'Location captured, but please retry if possible for better accuracy.');
        setLoading(false);
      },
      (geoError) => {
        setLoading(false);
        setMessage('');
        setError(geoError.code === geoError.PERMISSION_DENIED ? 'Location permission was denied. Please allow location access and try again.' : 'Could not capture location. Please retry without refreshing the page.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function adjust(deltaLat: number, deltaLng: number) {
    if (!value) return;
    onChange({ ...value, latitude: Number((value.latitude + deltaLat).toFixed(7)), longitude: Number((value.longitude + deltaLng).toFixed(7)), adjusted: true, verified: true });
    setMessage('✅ Property location verified successfully.');
  }

  return (
    <section className="location-verification-panel" aria-labelledby="location-verification-title">
      <div>
        <span className="section-eyebrow">Trust & Verification</span>
        <h2 id="location-verification-title">Property Location Verification</h2>
        <p className="small-note">Every property should be pinned from its real physical location. This helps PataSpace improve trust, matching, fraud detection, future map search and viewing directions.</p>
      </div>
      <div className="location-option-grid">
        <button type="button" className="property-category-card active" onClick={() => capture('standing-at-property')} disabled={loading}>
          <span aria-hidden="true">📍</span>
          <strong>Option 1 — Recommended</strong>
          <small>I am standing at this property now</small>
        </button>
        <button type="button" className="property-category-card" onClick={() => capture('current-location')} disabled={loading}>
          <span aria-hidden="true">📍</span>
          <strong>Option 2</strong>
          <small>Use my current location</small>
        </button>
      </div>
      {loading ? <div className="auth-message" role="status" aria-live="polite">Retrieving high-accuracy location. Please wait...</div> : null}
      {error ? <div className="auth-message location-warning" role="alert">{error}</div> : null}
      {value ? (
        <div className="verified-map-card">
          <div className="map-placeholder" role="img" aria-label="Interactive property map preview">
            <span className="map-pin" style={{ left: '50%', top: '50%' }}>📍</span>
          </div>
          <div className="pin-adjust-controls" aria-label="Fine adjust property pin">
            <button type="button" className="secondary-action" onClick={() => adjust(0.0001, 0)}>North</button>
            <button type="button" className="secondary-action" onClick={() => adjust(0, -0.0001)}>West</button>
            <button type="button" className="secondary-action" onClick={() => adjust(0, 0.0001)}>East</button>
            <button type="button" className="secondary-action" onClick={() => adjust(-0.0001, 0)}>South</button>
          </div>
          <dl className="profile-summary">
            <div><dt>Latitude</dt><dd>{value.latitude}</dd></div>
            <div><dt>Longitude</dt><dd>{value.longitude}</dd></div>
            <div><dt>GPS Accuracy</dt><dd>{Math.round(value.gpsAccuracyMeters)}m {value.gpsAccuracyMeters > LOCATION_ACCURACY_WARNING_THRESHOLD_METERS ? '— retry recommended' : ''}</dd></div>
            <div><dt>Detected Address</dt><dd>{value.humanReadableAddress || 'Address suggestion unavailable'}</dd></div>
          </dl>
        </div>
      ) : null}
      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
    </section>
  );
}

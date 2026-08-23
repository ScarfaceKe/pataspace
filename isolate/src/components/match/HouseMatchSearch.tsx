'use client';

import { useState } from 'react';
import { usePersistentMatchState } from './usePersistentMatchState';
import { NEARBY_PLACES, RESIDENTIAL_CATEGORIES, WATER_AVAILABILITY_OPTIONS, type NearbyPlaceId, type ResidentialCategoryId, type WaterAvailabilityId } from '@/domain/house-registration';
import type { HouseMatchIntelligenceResponse } from '@/domain/house-match-intelligence';

export function HouseMatchSearch() {
  const [searchStep, setSearchStep] = useState(1);
  const [residentialCategory, setResidentialCategory] = usePersistentMatchState<ResidentialCategoryId>('house-match:residentialCategory', 'bedsitter');
  const [county, setCounty] = usePersistentMatchState('house-match:county', '');
  const [townOrCity, setTownOrCity] = usePersistentMatchState('house-match:townOrCity', '');
  const [estateOrNeighbourhood, setEstateOrNeighbourhood] = usePersistentMatchState('house-match:estateOrNeighbourhood', '');
  const [maximumMonthlyRent, setMaximumMonthlyRent] = usePersistentMatchState('house-match:maximumMonthlyRent', '');
  const [maximumDeposit, setMaximumDeposit] = usePersistentMatchState('house-match:maximumDeposit', '');
  const [waterAvailability, setWaterAvailability] = usePersistentMatchState<WaterAvailabilityId[]>('house-match:waterAvailability', []);
  const [electricityRequired, setElectricityRequired] = usePersistentMatchState<'yes' | 'no' | 'any'>('house-match:electricityRequired', 'any');
  const [nearbyPlaces, setNearbyPlaces] = usePersistentMatchState<NearbyPlaceId[]>('house-match:nearbyPlaces', []);
  const [aiSearchDescription, setAiSearchDescription] = usePersistentMatchState('house-match:aiSearchDescription', '');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<HouseMatchIntelligenceResponse | null>(null);

  function toggleWater(id: WaterAvailabilityId) { setWaterAvailability((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function toggleNearby(id: NearbyPlaceId) { setNearbyPlaces((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  async function search() {
    setMessage('Finding matching homes...');
    const result = await fetch('/api/match/house/intelligent', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ residentialCategory, county, townOrCity, estateOrNeighbourhood, maximumMonthlyRent: maximumMonthlyRent ? Number(maximumMonthlyRent) : undefined, maximumDeposit: maximumDeposit ? Number(maximumDeposit) : undefined, waterAvailability, electricityRequired, nearbyPlaces, aiSearchDescription })
    });
    const data = await result.json();
    setResponse(data);
    setMessage(data.cards?.length ? 'Best matching homes prepared.' : 'No exact matches yet. PataSpace avoids empty results where suitable alternatives exist.');
  }

  return (
    <section className="property-registration-card match-wizard" aria-labelledby="house-match-title">
      <div className="auth-header"><span className="section-eyebrow">House Match</span><h1 id="house-match-title">Find homes that fit your needs</h1><p>Use guided choices. PataSpace uses registration, verification and vacancy confirmation data behind the scenes.</p></div>
      <div className="match-progress" aria-label="House Match progress">{[1, 2, 3, 4].map((item) => <button key={item} type="button" className={searchStep === item ? 'step active' : 'step'} onClick={() => setSearchStep(item)}>{item}</button>)}</div>
      <div className="wizard-step-label">Step {searchStep} of 4</div>
      <div className="auth-step">
        {searchStep === 1 ? <section className="wizard-panel"><h2>Location and budget</h2><div className="property-category-grid">{RESIDENTIAL_CATEGORIES.filter((item) => item.id !== 'mixed-residential-property').map((item) => <button key={item.id} type="button" className={residentialCategory === item.id ? 'property-category-card active' : 'property-category-card'} onClick={() => setResidentialCategory(item.id)}><strong>{item.label}</strong><small>{item.description}</small></button>)}</div><div className="nearby-grid"><label className="field-label">County<input value={county} onChange={(event) => setCounty(event.target.value)} placeholder="Nairobi" /></label><label className="field-label">Town / City<input value={townOrCity} onChange={(event) => setTownOrCity(event.target.value)} placeholder="Nairobi" /></label><label className="field-label">Estate / Neighbourhood<input value={estateOrNeighbourhood} onChange={(event) => setEstateOrNeighbourhood(event.target.value)} placeholder="Kilimani" /></label><label className="field-label">Tell us your maximum monthly rent budget<input type="number" value={maximumMonthlyRent} onChange={(event) => setMaximumMonthlyRent(event.target.value)} /></label><label className="field-label">Maximum Deposit <small>(optional)</small><input type="number" value={maximumDeposit} onChange={(event) => setMaximumDeposit(event.target.value)} /></label></div></section> : null}
        {searchStep === 2 ? <section className="wizard-panel"><h2>Utilities</h2><fieldset className="selection-fieldset"><legend>Water Information</legend>{WATER_AVAILABILITY_OPTIONS.map((item) => <label key={item.id}><input type="checkbox" checked={waterAvailability.includes(item.id)} onChange={() => toggleWater(item.id)} /> {item.label}</label>)}</fieldset><fieldset className="selection-fieldset"><legend>Electricity Required?</legend><label><input type="radio" checked={electricityRequired === 'any'} onChange={() => setElectricityRequired('any')} /> Any</label><label><input type="radio" checked={electricityRequired === 'yes'} onChange={() => setElectricityRequired('yes')} /> Yes</label><label><input type="radio" checked={electricityRequired === 'no'} onChange={() => setElectricityRequired('no')} /> No</label></fieldset><div className="auth-message">Parking, security, and other building-specific details are considered where available in verified listing data.</div></section> : null}
        {searchStep === 3 ? <section className="wizard-panel"><h2>Nearby places and preferences</h2><fieldset className="selection-fieldset"><legend>Nearby Places</legend>{NEARBY_PLACES.map((item) => <label key={item.id}><input type="checkbox" checked={nearbyPlaces.includes(item.id)} onChange={() => toggleNearby(item.id)} /> {item.label}</label>)}</fieldset><label className="field-label">Tell us more to help us find your ideal property.<textarea className="large-description-field" rows={5} value={aiSearchDescription} onChange={(event) => setAiSearchDescription(event.target.value)} placeholder="Describe anything else that matters to you." /></label></section> : null}
        {searchStep === 4 ? <section className="wizard-panel"><h2>Review and submit</h2><div className="review-summary-card"><p><strong>Location:</strong> {[estateOrNeighbourhood, townOrCity, county].filter(Boolean).join(', ') || 'Not specified'}</p><p><strong>Budget:</strong> {maximumMonthlyRent ? `KES ${Number(maximumMonthlyRent).toLocaleString()}` : 'Not specified'} · Deposit optional {maximumDeposit ? `KES ${Number(maximumDeposit).toLocaleString()}` : 'not entered'}</p><p><strong>Utilities:</strong> Electricity {electricityRequired}; water choices {waterAvailability.length}</p></div><button className="primary-action" type="button" onClick={search}>Prepare House Matches</button></section> : null}
        <div className="wizard-controls"><button type="button" className="secondary-action" disabled={searchStep === 1} onClick={() => setSearchStep((s) => Math.max(1, s - 1))}>Back</button>{searchStep < 4 ? <button type="button" className="primary-action" onClick={() => setSearchStep((s) => Math.min(4, s + 1))}>Continue</button> : null}</div>
        {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
        {response ? <div className="review-summary-card"><h3>Approved result batch</h3><p>{response.cards.length} result card(s) prepared from {response.limitedBatch.totalQualifiedMatches} qualified match(es).</p><p>Smart Rotation: {response.smartRotation.applied ? 'Prepared for future batches' : 'Not needed for this search'}.</p></div> : null}
        {response?.cards.map((card) => <article className="info-card property-result-card" key={card.result.resultId}><div className="property-image-frame" aria-label="Property image preview"><span aria-hidden="true">🏠</span></div><div className="property-card-body"><div className="property-card-topline"><span className="badge">{card.result.verificationStatus === 'verified' ? 'Verified' : 'Verification pending'}</span><span className="match-score">Match {Math.max(70, 100 - card.rank * 3)}%</span></div><h3>{card.result.residentialCategory.replaceAll('-', ' ')} · {card.result.matchedUnitIdentifier}</h3><p className="property-location">{card.result.location.estateOrAreaOrNeighbourhood || card.result.location.townOrCity}, {card.result.location.county}</p><p className="property-price">{card.result.monthlyRent !== null ? `KES ${card.result.monthlyRent.toLocaleString()} / month` : 'Price available in listing summary'}</p><p><strong>Summary:</strong> {card.aiSummary.text}</p><ul>{card.whyThisHomeMatches.map((reason) => <li key={reason.id}>{reason.label}</li>)}</ul><p>Unlock This Listing: KES {card.unlockThisListing.price.amount}</p><p>{card.verifiedAccess.recommended ? 'Verified Access recommended. Individual unlock remains available.' : 'Individual Unlock This Listing is recommended. Verified Access remains available.'}</p><div className="hero-actions"><button className="primary-action" type="button">Unlock This Listing</button><button className="secondary-action" type="button">Verified Access</button></div><p>Contact details, WhatsApp, and Request Viewing unlock after access is granted.</p></div></article>)}
      </div>
    </section>
  );
}

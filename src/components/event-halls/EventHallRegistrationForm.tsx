'use client';

import { PropertyLocationVerificationStep } from '@/components/properties/PropertyLocationVerificationStep';
import { ListingWhatsAppSupport } from '@/components/support/ListingWhatsAppSupport';
import type { PropertyLocationVerification } from '@/domain/location-verification';
import { useMemo, useState } from 'react';
import {
  EVENT_HALL_REGISTRATION_FOUNDATION,
  HALL_CATEGORIES,
  HALL_NEARBY_PLACES,
  HALL_PHOTO_GUIDANCE,
  HALL_ROAD_VISIBILITY_OPTIONS,
  HALL_SIZE_OPTIONS,
  ALL_HALL_DAYS,
  DAY_LABELS,
  createDefaultWorkingHours,
  isMixedHallProperty,
  type HallAvailabilityAnswer,
  type HallCategoryId,
  type HallNearbyPlaceId,
  type HallRoadVisibilityId,
  type HallSizeId,
  type HallWorkingHours
} from '@/domain/event-hall-registration';
import { KENYA_COUNTIES, KNOWN_KENYA_LOCATION_TERMS } from '@/domain/kenya-location-intelligence';
import { getRegistrationResponsibilityCopy, type PropertyOwnershipRole, type PropertyRegistrationAction } from '@/domain/property-registration';
import type { UserRoleId } from '@/domain/types';
import { summarizeImageUploadResults, uploadPropertyImageFiles } from '@/components/properties/propertyImageUploadClient';

interface WhatsAppContactDraft {
  whatsappNumber: string;
  role: PropertyOwnershipRole;
  fullName: string;
}

const totalSteps = 14;
function toNumberOrNull(value: string): number | null { if (!value.trim()) return null; const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; }

export function EventHallRegistrationForm({ profileRole }: { profileRole: UserRoleId }) {
  const defaultOwnership: PropertyOwnershipRole = profileRole === 'property-owner' ? 'owner' : profileRole === 'leasing-agent' ? 'leasing-agent' : 'property-manager';
  const [step, setStep] = useState(1);
  const [locationVerification, setLocationVerification] = useState<PropertyLocationVerification | undefined>();
  const [hallSize, setHallSize] = useState<HallSizeId>('medium');
  const [hallName, setHallName] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [hallCategory, setHallCategory] = useState<HallCategoryId>('general-event-hall');
  const [mixedHallCategories, setMixedHallCategories] = useState<HallCategoryId[]>([]);
  const [county, setCounty] = useState('');
  const [townOrCity, setTownOrCity] = useState('');
  const [estateOrArea, setEstateOrArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [roadVisibility, setRoadVisibility] = useState<HallRoadVisibilityId>('inside-commercial-building');
  const [numberOfHalls, setNumberOfHalls] = useState('');
  const [hallCapacity, setHallCapacity] = useState('');
  const [hallIdentifiers, setHallIdentifiers] = useState('');
  const [isAvailableForBookings, setIsAvailableForBookings] = useState<HallAvailabilityAnswer>('yes');
  const [bookingPrice, setBookingPrice] = useState('');
  const [additionalPricingArrangements, setAdditionalPricingArrangements] = useState('');
  const [selectedNearbyPlaces, setSelectedNearbyPlaces] = useState<Record<HallNearbyPlaceId, boolean>>({
    'main-road': false, 'bus-stage': false, 'shopping-centre': false, hotel: false, hospital: false
  });
  const [workingHours, setWorkingHours] = useState<HallWorkingHours[]>(createDefaultWorkingHours());
  const [nearbyPlaces, setNearbyPlaces] = useState<Record<HallNearbyPlaceId, string>>({ 'main-road': '', 'bus-stage': '', 'shopping-centre': '', hotel: '', hospital: '' });
  const [entrancePhotoNames, setEntrancePhotoNames] = useState<string[]>([]);
  const [entrancePhotoFiles, setEntrancePhotoFiles] = useState<File[]>([]);
  const [buildingExteriorPhotoNames, setBuildingExteriorPhotoNames] = useState<string[]>([]);
  const [buildingExteriorPhotoFiles, setBuildingExteriorPhotoFiles] = useState<File[]>([]);
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContactDraft[]>([
    { whatsappNumber: '', role: 'property-manager', fullName: '' }
  ]);
  const [description, setDescription] = useState('');
  const [ownershipRole, setOwnershipRole] = useState<PropertyOwnershipRole>(defaultOwnership);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingAction, setSavingAction] = useState<PropertyRegistrationAction | null>(null);

  const parsedHallIdentifiers = useMemo(() => {
    return hallIdentifiers.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
  }, [hallIdentifiers]);

  function toggleMixedHallCategory(id: HallCategoryId) {
    setMixedHallCategories((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function selectEntrancePhotos(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    setEntrancePhotoFiles(files);
    setEntrancePhotoNames(files.map((file) => file.name));
  }

  function selectBuildingExteriorPhotos(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    setBuildingExteriorPhotoFiles(files);
    setBuildingExteriorPhotoNames(files.map((file) => file.name));
  }

  function updateWhatsAppContact(index: number, updates: Partial<WhatsAppContactDraft>) {
    setWhatsappContacts((current) => current.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  }

  function addWhatsAppContact() {
    setWhatsappContacts((current) => [...current, { whatsappNumber: '', role: 'leasing-agent', fullName: '' }]);
  }

  function removeWhatsAppContact(index: number) {
    setWhatsappContacts((current) => current.filter((_, i) => i !== index));
  }

  async function save(action: PropertyRegistrationAction) {
    setSavingAction(action);
    setErrors({});
    setMessage(action === 'save-draft' ? 'Saving your event hall draft...' : 'Submitting event hall...');
    const response = await fetch('/api/event-halls/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hallSize,
        hallName,
        unitNumber,
        hallCategory: isMixedHallProperty(hallCategory) ? mixedHallCategories[0] ?? 'general-event-hall' : hallCategory,
        mixedHallCategories: isMixedHallProperty(hallCategory) ? mixedHallCategories : undefined,
        location: { county, townOrCity, estateOrAreaOrNeighbourhood: estateOrArea, landmark, verification: locationVerification },
        roadVisibility,
        numberOfHalls: toNumberOrNull(numberOfHalls),
        hallCapacity: toNumberOrNull(hallCapacity),
        hallIdentifiers: hallIdentifiers.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean),
        isAvailableForBookings,
        bookingPrice: toNumberOrNull(bookingPrice),
        additionalPricingArrangements,
        workingHours,
        nearbyPlaces: Object.entries(nearbyPlaces).filter(([placeId, approximateDistance]) => selectedNearbyPlaces[placeId as HallNearbyPlaceId] && approximateDistance.trim()).map(([place, approximateDistance]) => ({ place, approximateDistance })),
        entrancePhotos: entrancePhotoNames.map((fileName) => ({ fileName })),
        buildingPhotos: buildingExteriorPhotoNames.map((fileName) => ({ fileName })),
        whatsappContacts: whatsappContacts.filter((c) => c.whatsappNumber.trim()),
        description,
        ownershipRole,
        action
      })
    });
    const result = await response.json();
    setSavingAction(null);
    if (!result.ok) { setErrors(result.fieldErrors ?? {}); setMessage(result.message ?? 'Please check the highlighted details and try again.'); return; }
    let imageUploadSummary = '';
    const allPhotoFiles = [...entrancePhotoFiles, ...buildingExteriorPhotoFiles];
    if (result.eventHall?.propertyFoundationId && allPhotoFiles.length) {
      const uploadResults = await uploadPropertyImageFiles({ propertyId: result.eventHall.propertyFoundationId, files: allPhotoFiles, onProgress: setMessage });
      imageUploadSummary = summarizeImageUploadResults(uploadResults);
    }
    setMessage(`${action === 'submit-registration' ? `${EVENT_HALL_REGISTRATION_FOUNDATION.successMessage} ${parsedHallIdentifiers.length > 0 ? 'Once the admin approves your listing, you will be notified via WhatsApp to upload photos for each individual hall. Each hall should have its own photos.' : 'If available for bookings, it proceeds to future platform workflows.'}` : result.message}${imageUploadSummary ? ` ${imageUploadSummary}` : ''}`);
  }

  return <section className="property-registration-card" aria-labelledby="hall-registration-title">
    <div className="auth-header"><span className="section-eyebrow">Event hall registration</span><h1 id="hall-registration-title">Register an event hall</h1><p>{getRegistrationResponsibilityCopy(profileRole)} This guided workflow inherits PataSpace's choice-first registration standard.</p></div>
    <ListingWhatsAppSupport context="listing" />
    <div className="progress-steps" aria-label="Event hall registration progress">{Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => <button key={n} type="button" className={step === n ? 'step active' : 'step'} onClick={() => setStep(n)} aria-current={step === n ? 'step' : undefined}>{n}</button>)}</div>

    {/* Step 1: Hall Size — Simple, user-friendly, hides any internal pricing logic */}
    {step === 1 ? (
      <section className="auth-step" aria-labelledby="hall-size-title">
        <h2 id="hall-size-title">How big is your event hall?</h2>
        <p className="small-note">Select the size that best describes your hall or garden space. This helps us show it to the right customers.</p>
        <div className="property-category-grid">
          {HALL_SIZE_OPTIONS.map((item) => (
            <button key={item.id} type="button" className={hallSize === item.id ? 'property-category-card active' : 'property-category-card'} onClick={() => setHallSize(item.id)} aria-pressed={hallSize === item.id}>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </button>
          ))}
        </div>
        {errors.hallSize ? <p className="field-error">{errors.hallSize}</p> : null}
      </section>
    ) : null}

    {/* Step 2: Hall Category — Simplified, plain language */}
    {step === 2 ? (
      <section className="auth-step" aria-labelledby="hall-category-title">
        <h2 id="hall-category-title">What kind of event space is this?</h2>
        {isMixedHallProperty(hallCategory) ? (
          <>
            <p className="small-note">Your venue has different types of event spaces. Select <strong>all</strong> that exist in your property.</p>
            <div className="property-category-grid">
              {HALL_CATEGORIES.filter((item) => item.id !== 'mixed-hall-category').map((item) => (
                <button key={item.id} type="button" className={mixedHallCategories.includes(item.id) ? 'property-category-card active' : 'property-category-card'} onClick={() => toggleMixedHallCategory(item.id)}>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
            <p className="small-note" style={{marginTop: '0.5rem'}}>{mixedHallCategories.length} of 7 hall types selected{mixedHallCategories.length === 0 ? ' — please select at least one' : ''}</p>
          </>
        ) : (
          <>
            <p className="small-note">Choose the option that best describes the kind of events this space is suited for.</p>
            <div className="property-category-grid">
              {HALL_CATEGORIES.map((item) => (
                <button key={item.id} type="button" className={hallCategory === item.id ? 'property-category-card active' : 'property-category-card'} onClick={() => setHallCategory(item.id)}>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    ) : null}

    {/* Step 3: Hall Information — Name + Unit Number */}
    {step === 3 ? (
      <section className="auth-step">
        <h2>Hall Information</h2>
        <label className="field-label">Hall Name<input value={hallName} onChange={(e) => setHallName(e.target.value)} />{errors.hallName ? <span>{errors.hallName}</span> : null}</label>
        <label className="field-label">Unit Number *<input value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} placeholder="For example Hall A, Hall B or Main Hall" /><span className="small-note">Every listing must have a unique unit number for identification.</span>{errors.unitNumber ? <span>{errors.unitNumber}</span> : null}</label>
      </section>
    ) : null}

    {step === 4 ? <section className="auth-step"><h2>Property Location</h2><label className="field-label">County<input list="kenya-counties" value={county} onChange={(e) => setCounty(e.target.value)} />{errors.county ? <span>{errors.county}</span> : null}</label><label className="field-label">Town / City<input list="known-kenya-locations" value={townOrCity} onChange={(e) => setTownOrCity(e.target.value)} />{errors.townOrCity ? <span>{errors.townOrCity}</span> : null}</label><label className="field-label">Estate / Area<input list="known-kenya-locations" value={estateOrArea} onChange={(e) => setEstateOrArea(e.target.value)} />{errors.estateOrArea ? <span>{errors.estateOrArea}</span> : null}</label><label className="field-label">Landmark (optional)<input value={landmark} onChange={(e) => setLandmark(e.target.value)} /></label><ListingWhatsAppSupport context="location" /><PropertyLocationVerificationStep value={locationVerification} onChange={setLocationVerification} onSuggestedAddress={(suggested) => { if (suggested.county && !county) setCounty(suggested.county); if (suggested.town && !townOrCity) setTownOrCity(suggested.town); if (suggested.estate && !estateOrArea) setEstateOrArea(suggested.estate); if (suggested.road && !landmark) setLandmark(suggested.road); }} /><datalist id="kenya-counties">{KENYA_COUNTIES.map((item) => <option key={item} value={item} />)}</datalist><datalist id="known-kenya-locations">{KNOWN_KENYA_LOCATION_TERMS.map((item) => <option key={item} value={item} />)}</datalist></section> : null}
    {step === 5 ? <section className="auth-step"><h2>Where is the event hall located?</h2><fieldset className="selection-fieldset"><legend>Road visibility</legend>{HALL_ROAD_VISIBILITY_OPTIONS.map((item) => <label key={item.id}><input type="radio" name="hallRoadVisibility" checked={roadVisibility === item.id} onChange={() => setRoadVisibility(item.id)} /> {item.label}</label>)}</fieldset></section> : null}
    {step === 6 ? <section className="auth-step"><h2>Hall Details</h2><label className="field-label">Number of Halls available<input type="number" min="1" value={numberOfHalls} onChange={(e) => setNumberOfHalls(e.target.value)} />{errors.numberOfHalls ? <span>{errors.numberOfHalls}</span> : null}</label><label className="field-label">Hall Capacity (where applicable)<input type="number" min="1" value={hallCapacity} onChange={(e) => setHallCapacity(e.target.value)} />{errors.hallCapacity ? <span>{errors.hallCapacity}</span> : null}</label><label className="field-label">Real-world hall identifiers<textarea className="large-description-field" rows={3} value={hallIdentifiers} onChange={(e) => setHallIdentifiers(e.target.value)} placeholder="Enter each actual hall identifier exactly as it appears, for example Hall A, Hall B or Main Hall." />{errors.hallIdentifiers ? <span>{errors.hallIdentifiers}</span> : null}</label>{parsedHallIdentifiers.length > 0 ? <p className="small-note" style={{marginTop: '0.5rem'}}>{parsedHallIdentifiers.length} hall{parsedHallIdentifiers.length > 1 ? 's' : ''} detected: {parsedHallIdentifiers.join(', ')}</p> : null}</section> : null}
    {step === 7 ? <section className="auth-step"><h2>Availability</h2><fieldset className="selection-fieldset"><legend>Is this hall currently available for bookings?</legend><label><input type="radio" name="hallAvailability" checked={isAvailableForBookings === 'yes'} onChange={() => setIsAvailableForBookings('yes')} /> Yes</label><label><input type="radio" name="hallAvailability" checked={isAvailableForBookings === 'no'} onChange={() => setIsAvailableForBookings('no')} /> No</label></fieldset>{isAvailableForBookings === 'no' ? <p className="auth-message">The hall can be registered without making it available for customer searches.</p> : null}</section> : null}
    {step === 8 ? <section className="auth-step"><h2>Pricing</h2>{isAvailableForBookings === 'yes' ? <label className="field-label">Hall Booking Price<input type="number" min="0" value={bookingPrice} onChange={(e) => setBookingPrice(e.target.value)} />{errors.bookingPrice ? <span>{errors.bookingPrice}</span> : null}</label> : null}<label className="field-label">Additional pricing arrangements, if any<textarea className="large-description-field" rows={3} value={additionalPricingArrangements} onChange={(e) => setAdditionalPricingArrangements(e.target.value)} /></label></section> : null}
    {step === 9 ? <section className="auth-step"><h2>Working Hours</h2><p className="small-note">Set the operational schedule for your hall. These hours will be used to display real-time availability to customers and validate booking times.</p>{ALL_HALL_DAYS.map((day, index) => { const wh = workingHours.find((w) => w.day === day)!; return <div key={day} style={{marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--border-subtle, #e2e8f0)', borderRadius: '0.5rem'}}><label className="field-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}><input type="checkbox" checked={wh.isOpen} onChange={(e) => setWorkingHours((current) => current.map((w) => w.day === day ? { ...w, isOpen: e.target.checked } : w))} style={{width: 'auto'}} /><strong>{DAY_LABELS[day]}</strong></label>{wh.isOpen ? <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}><label className="field-label">Open<input type="time" value={wh.openTime} onChange={(e) => setWorkingHours((current) => current.map((w) => w.day === day ? { ...w, openTime: e.target.value } : w))} /></label><span style={{margin: '0 0.25rem'}}>-</span><label className="field-label">Close<input type="time" value={wh.closeTime} onChange={(e) => setWorkingHours((current) => current.map((w) => w.day === day ? { ...w, closeTime: e.target.value } : w))} /></label></div> : <p className="small-note">Closed on {DAY_LABELS[day]}s</p>}</div>; })}</section> : null}
    {step === 10 ? <section className="auth-step"><h2>Nearby Places</h2><p className="small-note">Which of these amenities are close to your event hall? Select all that apply. You will enter the distances on the next step.</p><div className="nearby-grid">{HALL_NEARBY_PLACES.map((item) => <label key={item.id} className="field-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem'}}><input type="checkbox" checked={selectedNearbyPlaces[item.id]} onChange={(e) => setSelectedNearbyPlaces((current) => ({ ...current, [item.id]: e.target.checked }))} style={{width: 'auto'}} />{item.label}</label>)}</div></section> : null}
    {step === 11 ? <section className="auth-step"><h2>Amenity Distances</h2><p className="small-note">Enter the approximate distance for each selected amenity. Use metres or walking time.</p><div className="nearby-grid">{HALL_NEARBY_PLACES.filter((item) => selectedNearbyPlaces[item.id]).map((item) => <div key={item.id} style={{marginBottom: '0.75rem'}}><label className="field-label">{item.label}<input style={{marginTop: '0.25rem'}} value={nearbyPlaces[item.id]} onChange={(e) => setNearbyPlaces((current) => ({ ...current, [item.id]: e.target.value }))} placeholder="e.g. 300m or 5 minutes walk" /></label></div>)}</div>{HALL_NEARBY_PLACES.filter((item) => selectedNearbyPlaces[item.id]).length === 0 ? <p className="auth-message">No amenities were selected. You can go back to select some or skip this step.</p> : null}</section> : null}
    {step === 12 ? <section className="auth-step"><h2>Property Photos</h2><div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}><span className="badge">Required: Entrance Photo</span><p className="small-note" style={{marginTop: '0.5rem'}}>Upload a clear photo of the main hall entrance. This helps customers identify the property.</p><label className="field-label">Entrance photo<input type="file" accept="image/*" multiple onChange={(e) => selectEntrancePhotos(e.target.files)} /></label><ul className="photo-guidance-list"><li>Main entrance or gate</li><li>Entrance showing the hall name or number if visible</li></ul>{entrancePhotoNames.length ? <ul className="uploaded-photo-list">{entrancePhotoNames.map((name) => <li key={name}>{name}</li>)}</ul> : null}</div><div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}><span className="badge">Required: Whole Building Photo</span><p className="small-note" style={{marginTop: '0.5rem'}}>Upload a photo showing the entire building exterior. This helps customers see the full property and surroundings.</p><label className="field-label">Whole building photo<input type="file" accept="image/*" multiple onChange={(e) => selectBuildingExteriorPhotos(e.target.files)} /></label><ul className="photo-guidance-list"><li>Building exterior from the street</li><li>Shared areas (corridors, parking) where applicable</li></ul>{buildingExteriorPhotoNames.length ? <ul className="uploaded-photo-list">{buildingExteriorPhotoNames.map((name) => <li key={name}>{name}</li>)}</ul> : null}</div>{parsedHallIdentifiers.length > 0 ? <div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}><span className="badge" style={{background: 'var(--info-bg, #eff6ff)', color: 'var(--info-text, #1e40af)'}}>Note: Hall Interior Photos</span><p className="small-note" style={{marginTop: '0.5rem'}}>After the admin approves your listing, you will be prompted to upload photos for each individual hall. Each hall should have its own photos of the interior areas (stage, seating, entrance).</p></div> : null}<ul className="photo-guidance-list">{HALL_PHOTO_GUIDANCE.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
    {step === 13 ? <section className="auth-step"><h2>Property Description</h2><label className="field-label">Honest and accurate event hall description<textarea className="large-description-field" rows={7} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the hall, capacity, location, accessibility, parking, stage setup, seating arrangement, surroundings and condition. Avoid exaggerated marketing language." />{errors.description ? <span>{errors.description}</span> : null}</label><fieldset className="selection-fieldset"><legend>Registration relationship</legend><label><input type="radio" name="hallOwnership" checked={ownershipRole === 'owner'} onChange={() => setOwnershipRole('owner')} /> I am the Owner</label><label><input type="radio" name="hallOwnership" checked={ownershipRole === 'property-manager'} onChange={() => setOwnershipRole('property-manager')} /> I am the Property Manager</label><label><input type="radio" name="hallOwnership" checked={ownershipRole === 'leasing-agent'} onChange={() => setOwnershipRole('leasing-agent')} /> I am the Leasing Agent</label></fieldset></section> : null}

    {step === 14 ? (
      <section className="auth-step"><h2>WhatsApp Contacts</h2><p className="small-note">Provide WhatsApp numbers for key contacts. The property manager's number receives most notifications about the listing, bookings, and customer activity.</p>
        {whatsappContacts.map((contact, index) => (
          <div className="house-vacancy-card" key={`whatsapp-${index}`} style={{marginBottom: '1rem'}}>
            <fieldset className="selection-fieldset"><legend>Contact Role</legend><label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'property-manager'} onChange={() => updateWhatsAppContact(index, { role: 'property-manager' })} /> Property Manager</label><label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'owner'} onChange={() => updateWhatsAppContact(index, { role: 'owner' })} /> Owner</label><label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'leasing-agent'} onChange={() => updateWhatsAppContact(index, { role: 'leasing-agent' })} /> Leasing Agent</label></fieldset>
            <label className="field-label">Full Name<input value={contact.fullName} onChange={(e) => updateWhatsAppContact(index, { fullName: e.target.value })} placeholder="Contact full name" /></label>
            <label className="field-label">WhatsApp Number<input value={contact.whatsappNumber} onChange={(e) => updateWhatsAppContact(index, { whatsappNumber: e.target.value })} placeholder="For example +254 712 345 678" />{errors[`whatsapp-${index}`] ? <span>{errors[`whatsapp-${index}`]}</span> : null}</label>
            {whatsappContacts.length > 1 ? <button type="button" className="secondary-action" onClick={() => removeWhatsAppContact(index)}>Remove</button> : null}
          </div>
        ))}
        {whatsappContacts.length < 3 ? <button type="button" className="secondary-action" onClick={addWhatsAppContact}>Add Another Contact</button> : null}
        <p className="small-note" style={{marginTop: '1rem'}}>You can add up to 3 contacts: the Property Manager, Owner, and Leasing Agent. The Property Manager's WhatsApp number will receive booking notifications, availability updates, and customer activity alerts.</p>
      </section>
    ) : null}

    <div className="auth-actions">{step > 1 ? <button type="button" className="secondary-action" onClick={() => setStep(step - 1)}>Back</button> : null}{step < totalSteps ? <button type="button" className="primary-action" onClick={() => setStep(step + 1)}>Continue</button> : null}<button type="button" className="secondary-action" onClick={() => save('save-draft')} disabled={savingAction !== null}>{savingAction === 'save-draft' ? 'Saving draft...' : 'Save as Draft'}</button><button type="button" className="secondary-action" onClick={() => save('save-draft')} disabled={savingAction !== null}>Continue Later</button>{step === totalSteps ? <button type="button" className="primary-action" onClick={() => save('submit-registration')} disabled={savingAction !== null}>{savingAction === 'submit-registration' ? 'Submitting...' : 'Submit Registration'}</button> : null}</div>
    {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
  </section>;
}

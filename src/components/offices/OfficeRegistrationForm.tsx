'use client';

import { PropertyLocationVerificationStep } from '@/components/properties/PropertyLocationVerificationStep';
import { ListingWhatsAppSupport } from '@/components/support/ListingWhatsAppSupport';
import type { PropertyLocationVerification } from '@/domain/location-verification';
import { useMemo, useState } from 'react';
import { LoadingButton } from '@/components/system/InlineSpinner';
import { KENYA_COUNTIES, KNOWN_KENYA_LOCATION_TERMS } from '@/domain/kenya-location-intelligence';
import { getRegistrationResponsibilityCopy, getFloorCountWithGroundFloor, ADDITIONAL_FLOOR_LOCATIONS, type PropertyOwnershipRole, type PropertyRegistrationAction, type AdditionalFloorLocationId } from '@/domain/property-registration';
import {
  OFFICE_DEPOSIT_STRUCTURES,
  OFFICE_NEARBY_PLACES,
  OFFICE_REGISTRATION_FOUNDATION,
  OFFICE_ROAD_VISIBILITY_OPTIONS,
  OFFICE_TYPES,
  OFFICE_WATER_AVAILABILITY_OPTIONS,
  isMixedOfficeProperty,
  officeWaterHasConnection,
  type OfficeDepositStructureId,
  type OfficeNearbyPlaceId,
  type OfficeRoadVisibilityId,
  type OfficeTypeId,
  type OfficeWaterAvailabilityId,
  type OfficeWaterRentInclusion
} from '@/domain/office-registration';
import type { UserRoleId } from '@/domain/types';
import { summarizeImageUploadResults, uploadPropertyImageFiles } from '@/components/properties/propertyImageUploadClient';

interface WhatsAppContactDraft {
  whatsappNumber: string;
  role: PropertyOwnershipRole;
  fullName: string;
}

const totalSteps = 14;
function toNumberOrNull(value: string): number | null { if (!value.trim()) return null; const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; }

export function OfficeRegistrationForm({ profileRole }: { profileRole: UserRoleId }) {
  const defaultOwnership: PropertyOwnershipRole = profileRole === 'property-owner' ? 'owner' : profileRole === 'leasing-agent' ? 'leasing-agent' : 'property-manager';
  const [step, setStep] = useState(1);
  const [locationVerification, setLocationVerification] = useState<PropertyLocationVerification | undefined>();
  const [officeType, setOfficeType] = useState<OfficeTypeId>('private-office');
  const [mixedOfficeTypes, setMixedOfficeTypes] = useState<OfficeTypeId[]>([]);
  const [county, setCounty] = useState('');
  const [townOrCity, setTownOrCity] = useState('');
  const [estateOrArea, setEstateOrArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [roadVisibility, setRoadVisibility] = useState<OfficeRoadVisibilityId>('inside-office-building');
  const [officeName, setOfficeName] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [numberOfOfficeUnits, setNumberOfOfficeUnits] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState('');
  const [hasBasement, setHasBasement] = useState(false);
  const [hasMezzanine, setHasMezzanine] = useState(false);
  const [hasRooftop, setHasRooftop] = useState(false);
  const [vacantOfficeFloor, setVacantOfficeFloor] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [depositStructure, setDepositStructure] = useState<OfficeDepositStructureId>('one-month');
  const [depositAmount, setDepositAmount] = useState('');
  const [hasVacantOfficeUnits, setHasVacantOfficeUnits] = useState<'yes' | 'no'>('yes');
  const [vacancyMonthlyRent, setVacancyMonthlyRent] = useState('');
  const [vacancyDepositStructure, setVacancyDepositStructure] = useState<OfficeDepositStructureId>('one-month');
  const [vacancyDepositAmount, setVacancyDepositAmount] = useState('');
  const [quantityAvailable, setQuantityAvailable] = useState('1');
  const [unitIdentifiers, setUnitIdentifiers] = useState('');
  const [waterAvailability, setWaterAvailability] = useState<OfficeWaterAvailabilityId>('daily-water');
  const [specificDays, setSpecificDays] = useState('');
  const [waterRentInclusion, setWaterRentInclusion] = useState<OfficeWaterRentInclusion>('included');
  const [isElectricityAvailable, setIsElectricityAvailable] = useState<'yes' | 'no'>('yes');
  const [electricityBillingType, setElectricityBillingType] = useState<'individual-meter' | 'shared-meter' | 'included-in-rent' | 'other'>('individual-meter');
  const [electricityOtherBilling, setElectricityOtherBilling] = useState('');
  const [powerAvailabilityNotes, setPowerAvailabilityNotes] = useState('');
  const [selectedNearbyPlaces, setSelectedNearbyPlaces] = useState<Record<OfficeNearbyPlaceId, boolean>>({
    'bus-stage': false, 'main-road': false, 'shopping-centre': false, bank: false, hospital: false
  });
  const [nearbyPlaces, setNearbyPlaces] = useState<Record<OfficeNearbyPlaceId, string>>({ 'bus-stage': '', 'main-road': '', 'shopping-centre': '', bank: '', hospital: '' });
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
  const [submitted, setSubmitted] = useState(false);

  const parsedUnitIdentifiers = useMemo(() => {
    if (hasVacantOfficeUnits !== 'yes') return [];
    return unitIdentifiers.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  }, [unitIdentifiers, hasVacantOfficeUnits]);

  const parsedFloorCount = useMemo(() => getFloorCountWithGroundFloor(toNumberOrNull(numberOfFloors)), [numberOfFloors]);

  function toggleMixedOfficeType(id: OfficeTypeId) {
    setMixedOfficeTypes((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
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
    setSavingAction(action); setErrors({}); setMessage(action === 'save-draft' ? 'Saving your office draft...' : 'Submitting office property...');
    const response = await fetch('/api/offices/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },        body: JSON.stringify({
        officeType: isMixedOfficeProperty(officeType) ? mixedOfficeTypes[0] ?? 'private-office' : officeType,
        mixedOfficeTypes: isMixedOfficeProperty(officeType) ? mixedOfficeTypes : undefined,
        location: { county, townOrCity, estateOrAreaOrNeighbourhood: estateOrArea, landmark, verification: locationVerification },
        roadVisibility,
        officeName,
        unitNumber,
        numberOfOfficeUnits: toNumberOrNull(numberOfOfficeUnits),
        numberOfFloors: toNumberOrNull(numberOfFloors),
        additionalFloorLocations: [
          ...(hasBasement ? ['basement'] as const : []),
          ...(hasMezzanine ? ['mezzanine'] as const : []),
          ...(hasRooftop ? ['rooftop'] as const : []),
        ],
        vacantOfficeFloor: toNumberOrNull(vacantOfficeFloor),
        rent: { monthlyRent: toNumberOrNull(monthlyRent), depositStructure, depositAmount: toNumberOrNull(depositAmount) },
        hasVacantOfficeUnits,
        vacancy: hasVacantOfficeUnits === 'yes' ? {
          monthlyRent: toNumberOrNull(vacancyMonthlyRent) || toNumberOrNull(monthlyRent),
          depositStructure: vacancyDepositStructure,
          depositAmount: toNumberOrNull(vacancyDepositAmount) || toNumberOrNull(depositAmount),
          quantityAvailable: toNumberOrNull(quantityAvailable),
          unitIdentifiers: unitIdentifiers.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean)
        } : undefined,
        water: { availability: waterAvailability, specificDays, rentInclusion: officeWaterHasConnection(waterAvailability) ? waterRentInclusion : undefined },
        electricity: { isElectricityAvailable, billingType: isElectricityAvailable === 'yes' ? electricityBillingType : undefined, otherBillingDescription: electricityBillingType === 'other' ? electricityOtherBilling : undefined, powerAvailabilityNotes },
        nearbyPlaces: Object.entries(nearbyPlaces).filter(([placeId, approximateDistance]) => selectedNearbyPlaces[placeId as OfficeNearbyPlaceId] && approximateDistance.trim()).map(([place, approximateDistance]) => ({ place, approximateDistance })),
        entrancePhotos: entrancePhotoNames.map((fileName) => ({ fileName })),
        buildingPhotos: buildingExteriorPhotoNames.map((fileName) => ({ fileName })),
        whatsappContacts: whatsappContacts.filter((c) => c.whatsappNumber.trim()),
        description,
        ownershipRole,
        action
      })
    });
    const result = await response.json(); setSavingAction(null);
    if (!result.ok) { setErrors(result.fieldErrors ?? {}); setMessage(result.message ?? 'Please check the highlighted details and try again.'); return; }
    let imageUploadSummary = '';
    const allPhotoFiles = [...entrancePhotoFiles, ...buildingExteriorPhotoFiles];
    if (result.office?.propertyFoundationId && allPhotoFiles.length) {
      const uploadResults = await uploadPropertyImageFiles({ propertyId: result.office.propertyFoundationId, files: allPhotoFiles, onProgress: setMessage });
      imageUploadSummary = summarizeImageUploadResults(uploadResults);
    }
    setMessage(`${action === 'submit-registration' ? `${OFFICE_REGISTRATION_FOUNDATION.successMessage} ${hasVacantOfficeUnits === 'yes' ? 'Your office has been registered. Once the admin approves your listing, you will be notified via WhatsApp to upload photos for each individual vacant unit. Each unit needs its own photos since conditions may differ even if units look similar.' : 'If no vacancies exist, the property remains registered until vacancies become available.'}` : result.message}${imageUploadSummary ? ` ${imageUploadSummary}` : ''}`);
    if (action === 'submit-registration' && result.ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="property-registration-card" aria-labelledby="office-registration-title">
        <div className="registration-success">
          <span className="success-icon">✅</span>
          <h2>Registration Submitted Successfully</h2>
          <p className="success-subtitle">Your office property has been submitted and is now in the verification queue.</p>
          <div className="success-detail">
            <strong>What happens next:</strong>
            Your listing will be reviewed by our team. Once approved, it will appear in customer search results. {hasVacantOfficeUnits === 'yes' ? 'You will be notified via WhatsApp to upload photos for each individual vacant unit after approval.' : ''}You can track the status from your dashboard.
          </div>
          <div className="success-actions">
            <a className="primary-action" href="/dashboard">Go to Dashboard</a>
            <a className="secondary-action" href="/properties/register/office">Register Another Office</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="property-registration-card" aria-labelledby="office-registration-title">
      <div className="auth-header"><span className="section-eyebrow">Office registration</span><h1 id="office-registration-title">Register an office property</h1><p>{getRegistrationResponsibilityCopy(profileRole)} This guided workflow collects approved office information only.</p></div>
      <ListingWhatsAppSupport context="listing" />
      <div className="progress-steps" aria-label="Office registration progress">{Array.from({ length: totalSteps }, (_, index) => index + 1).map((item) => <button key={item} type="button" className={step === item ? 'step active' : 'step'} onClick={() => setStep(item)} aria-current={step === item ? 'step' : undefined}>{item}</button>)}</div>

      {step === 1 ? <section className="auth-step"><h2>What type of office space are you registering?</h2>{isMixedOfficeProperty(officeType) ? <p className="small-note">Your building has different types of offices. Select <strong>all</strong> office types that exist in your property.</p> : null}<div className="property-category-grid">{OFFICE_TYPES.map((item) => isMixedOfficeProperty(officeType) ? <button key={item.id} type="button" className={mixedOfficeTypes.includes(item.id) ? 'property-category-card active' : 'property-category-card'} onClick={() => item.id !== 'mixed-office-type' ? toggleMixedOfficeType(item.id) : setOfficeType(item.id)} aria-pressed={mixedOfficeTypes.includes(item.id)}><strong>{item.label}</strong><small>{item.description}</small></button> : <button key={item.id} type="button" className={officeType === item.id ? 'property-category-card active' : 'property-category-card'} onClick={() => setOfficeType(item.id)} aria-pressed={officeType === item.id}><strong>{item.label}</strong><small>{item.description}</small></button>)}</div>{isMixedOfficeProperty(officeType) ? <p className="small-note" style={{marginTop: '0.5rem'}}>{mixedOfficeTypes.length} of 5 office types selected{mixedOfficeTypes.length === 0 ? ' — please select at least one' : ''}</p> : null}{errors.officeType ? <p className="field-error">{errors.officeType}</p> : null}</section> : null}

      {step === 2 ? <section className="auth-step"><h2>Property Location</h2><label className="field-label">County<input list="kenya-counties" value={county} onChange={(e) => setCounty(e.target.value)} placeholder="Nairobi" />{errors.county ? <span>{errors.county}</span> : null}</label><label className="field-label">Town / City<input list="known-kenya-locations" value={townOrCity} onChange={(e) => setTownOrCity(e.target.value)} placeholder="Nairobi" />{errors.townOrCity ? <span>{errors.townOrCity}</span> : null}</label><label className="field-label">Estate / Area<input list="known-kenya-locations" value={estateOrArea} onChange={(e) => setEstateOrArea(e.target.value)} placeholder="Westlands" />{errors.estateOrArea ? <span>{errors.estateOrArea}</span> : null}</label><label className="field-label">Landmark (optional)<input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near a known landmark" /></label><ListingWhatsAppSupport context="location" /><PropertyLocationVerificationStep value={locationVerification} onChange={setLocationVerification} onSuggestedAddress={(suggested) => { if (suggested.county && !county) setCounty(suggested.county); if (suggested.town && !townOrCity) setTownOrCity(suggested.town); if (suggested.estate && !estateOrArea) setEstateOrArea(suggested.estate); if (suggested.road && !landmark) setLandmark(suggested.road); }} /><datalist id="kenya-counties">{KENYA_COUNTIES.map((item) => <option key={item} value={item} />)}</datalist><datalist id="known-kenya-locations">{KNOWN_KENYA_LOCATION_TERMS.map((item) => <option key={item} value={item} />)}</datalist></section> : null}

      {step === 3 ? <section className="auth-step"><h2>Where is the office located?</h2><fieldset className="selection-fieldset"><legend>Road visibility</legend>{OFFICE_ROAD_VISIBILITY_OPTIONS.map((item) => <label key={item.id}><input type="radio" name="officeRoadVisibility" checked={roadVisibility === item.id} onChange={() => setRoadVisibility(item.id)} /> {item.label}</label>)}</fieldset>{errors.roadVisibility ? <p className="field-error">{errors.roadVisibility}</p> : null}</section> : null}

      {step === 4 ? <section className="auth-step"><h2>Office Information</h2><label className="field-label">Office Name (optional)<input value={officeName} onChange={(e) => setOfficeName(e.target.value)} /></label><label className="field-label">Unit Number *<input value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} placeholder="For example Office 203, Unit 12 or A1" /><span className="small-note">Every listing must have a unique unit number for identification.</span>{errors.unitNumber ? <span>{errors.unitNumber}</span> : null}</label><label className="field-label">Number of Office Units<input type="number" min="1" value={numberOfOfficeUnits} onChange={(e) => setNumberOfOfficeUnits(e.target.value)} />{errors.numberOfOfficeUnits ? <span>{errors.numberOfOfficeUnits}</span> : null}</label><label className="field-label">Number of Floors (if applicable)<input type="number" min="1" value={numberOfFloors} onChange={(e) => setNumberOfFloors(e.target.value)} />{numberOfFloors ? <span className="small-note" style={{color: 'var(--text-secondary, #64748b)'}}>{parsedFloorCount}</span> : null}{errors.numberOfFloors ? <span>{errors.numberOfFloors}</span> : null}</label><div style={{marginTop: '0.75rem'}}><span className="field-label" style={{display: 'block', marginBottom: '0.5rem'}}>  Does this property have any of the following additional levels? <span style={{fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', display: 'block', fontWeight: 400, marginTop: '0.25rem'}}>Select all that apply. These levels will be permanently recorded with your listing.</span></span><div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>{ADDITIONAL_FLOOR_LOCATIONS.map((loc) => { const isActive = loc.id === 'basement' ? hasBasement : loc.id === 'mezzanine' ? hasMezzanine : hasRooftop; const toggle = loc.id === 'basement' ? setHasBasement : loc.id === 'mezzanine' ? setHasMezzanine : setHasRooftop; return (<button key={loc.id} type="button" onClick={() => toggle(!isActive)} style={{padding: '0.5rem 1rem', borderRadius: '9999px', border: isActive ? '2px solid var(--primary, #10b981)' : '2px solid var(--border, #e2e8f0)', background: isActive ? 'var(--primary-light, #ecfdf5)' : 'white', color: isActive ? 'var(--primary, #10b981)' : 'var(--text-secondary, #64748b)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s ease'}}>{isActive ? '\u2713 ' : ''}{loc.label}</button>); })}</div>{(hasBasement || hasMezzanine || hasRooftop) ? <span className="small-note" style={{color: 'var(--primary, #10b981)', marginTop: '0.5rem', display: 'block'}}>These additional levels are now part of your property record and will appear in search results, match details, and listing information.</span> : null}</div>{hasVacantOfficeUnits === 'yes' ? <label className="field-label">Floor where vacant office exists (if applicable)<input type="number" min="0" value={vacantOfficeFloor} onChange={(e) => setVacantOfficeFloor(e.target.value)} placeholder="Ground floor = 0" /><span className="small-note">You can also enter basement, mezzanine, or rooftop if applicable.</span>{errors.vacantOfficeFloor ? <span>{errors.vacantOfficeFloor}</span> : null}</label> : null}</section> : null}

      {step === 5 ? <section className="auth-step"><h2>Rent Information</h2><label className="field-label">Monthly Rent<input type="number" min="0" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} placeholder="Amount in KSh" />{errors.monthlyRent ? <span>{errors.monthlyRent}</span> : null}</label><fieldset className="selection-fieldset"><legend>Deposit Amount</legend>{OFFICE_DEPOSIT_STRUCTURES.map((item) => <label key={item.id}><input type="radio" name="officeDeposit" checked={depositStructure === item.id} onChange={() => setDepositStructure(item.id)} /> {item.label}</label>)}</fieldset><label className="field-label">Deposit amount entered directly<input type="number" min="0" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Do not restrict deposit values" />{errors.depositAmount ? <span>{errors.depositAmount}</span> : null}</label></section> : null}

      {step === 6 ? <section className="auth-step"><h2>Vacancy Information</h2><fieldset className="selection-fieldset"><legend>Are there currently vacant office units?</legend><label><input type="radio" name="hasVacantOfficeUnits" checked={hasVacantOfficeUnits === 'yes'} onChange={() => setHasVacantOfficeUnits('yes')} /> Yes</label><label><input type="radio" name="hasVacantOfficeUnits" checked={hasVacantOfficeUnits === 'no'} onChange={() => setHasVacantOfficeUnits('no')} /> No</label></fieldset>{hasVacantOfficeUnits === 'no' ? <p className="auth-message">The office property can be registered without publishing vacancies.</p> : null}{hasVacantOfficeUnits === 'yes' ? <div className="vacancy-foundation-panel"><span className="badge">Vacancy details</span><p className="small-note" style={{marginBottom: '1rem'}}>Rent and deposit values below are pre-filled from the property-level rent information. Override only if a specific unit has different pricing.</p><label className="field-label">Monthly Rent (auto-filled from property rent)<input type="number" min="0" value={vacancyMonthlyRent || monthlyRent} onChange={(e) => setVacancyMonthlyRent(e.target.value)} placeholder={monthlyRent ? `Same as property rent: ${monthlyRent}` : 'Enter rent'} />{errors.vacancyMonthlyRent ? <span>{errors.vacancyMonthlyRent}</span> : null}</label><fieldset className="selection-fieldset"><legend>Vacancy deposit</legend>{OFFICE_DEPOSIT_STRUCTURES.map((item) => <label key={item.id}><input type="radio" name="officeVacancyDeposit" checked={vacancyDepositStructure === item.id} onChange={() => setVacancyDepositStructure(item.id)} /> {item.label}</label>)}</fieldset><label className="field-label">Deposit (auto-filled from property deposit)<input type="number" min="0" value={vacancyDepositAmount || depositAmount} onChange={(e) => setVacancyDepositAmount(e.target.value)} placeholder={depositAmount ? `Same as property deposit: ${depositAmount}` : 'Enter deposit'} />{errors.vacancyDepositAmount ? <span>{errors.vacancyDepositAmount}</span> : null}</label><label className="field-label">Quantity Available<input type="number" min="1" value={quantityAvailable} onChange={(e) => setQuantityAvailable(e.target.value)} />{errors.quantityAvailable ? <span>{errors.quantityAvailable}</span> : null}</label><label className="field-label">Real-world vacant office identifiers<textarea className="large-description-field" rows={3} value={unitIdentifiers} onChange={(e) => setUnitIdentifiers(e.target.value)} placeholder="Enter each actual office identifier exactly as it appears, for example Office 203, Unit 12 or A1" />{errors.unitIdentifiers ? <span>{errors.unitIdentifiers}</span> : null}</label>{parsedUnitIdentifiers.length > 0 ? <p className="small-note" style={{marginTop: '0.5rem'}}>{parsedUnitIdentifiers.length} vacant unit{parsedUnitIdentifiers.length > 1 ? 's' : ''} detected: {parsedUnitIdentifiers.join(', ')}</p> : null}</div> : null}</section> : null}

      {step === 7 ? <section className="auth-step"><h2>Water Information</h2><fieldset className="selection-fieldset"><legend>Water availability</legend>{OFFICE_WATER_AVAILABILITY_OPTIONS.map((item) => <label key={item.id}><input type="radio" name="officeWater" checked={waterAvailability === item.id} onChange={() => setWaterAvailability(item.id)} /> {item.label}</label>)}</fieldset>{waterAvailability === 'specific-days' ? <label className="field-label">Which days is water available?<input value={specificDays} onChange={(e) => setSpecificDays(e.target.value)} />{errors.specificDays ? <span>{errors.specificDays}</span> : null}</label> : null}{officeWaterHasConnection(waterAvailability) ? <fieldset className="selection-fieldset"><legend>Is water included in the rent?</legend><label><input type="radio" name="officeWaterRent" checked={waterRentInclusion === 'included'} onChange={() => setWaterRentInclusion('included')} /> Included</label><label><input type="radio" name="officeWaterRent" checked={waterRentInclusion === 'paid-separately'} onChange={() => setWaterRentInclusion('paid-separately')} /> Paid Separately</label></fieldset> : null}</section> : null}

      {step === 8 ? <section className="auth-step"><h2>Electricity Information</h2><fieldset className="selection-fieldset"><legend>Is electricity available?</legend><label><input type="radio" name="officeElectricity" checked={isElectricityAvailable === 'yes'} onChange={() => setIsElectricityAvailable('yes')} /> Yes</label><label><input type="radio" name="officeElectricity" checked={isElectricityAvailable === 'no'} onChange={() => setIsElectricityAvailable('no')} /> No</label></fieldset>{isElectricityAvailable === 'yes' ? <div className="vacancy-foundation-panel"><fieldset className="selection-fieldset"><legend>How is electricity billed?</legend><label><input type="radio" name="officeElectricityBilling" checked={electricityBillingType === 'individual-meter'} onChange={() => setElectricityBillingType('individual-meter')} /> Individual Meter</label><label><input type="radio" name="officeElectricityBilling" checked={electricityBillingType === 'shared-meter'} onChange={() => setElectricityBillingType('shared-meter')} /> Shared Meter</label><label><input type="radio" name="officeElectricityBilling" checked={electricityBillingType === 'included-in-rent'} onChange={() => setElectricityBillingType('included-in-rent')} /> Included in Rent</label><label><input type="radio" name="officeElectricityBilling" checked={electricityBillingType === 'other'} onChange={() => setElectricityBillingType('other')} /> Other</label></fieldset>{electricityBillingType === 'other' ? <label className="field-label">Briefly describe the billing arrangement<input value={electricityOtherBilling} onChange={(e) => setElectricityOtherBilling(e.target.value)} />{errors.electricityOtherBilling ? <span>{errors.electricityOtherBilling}</span> : null}</label> : null}<label className="field-label">Power availability notes, if necessary<textarea className="large-description-field" rows={3} value={powerAvailabilityNotes} onChange={(e) => setPowerAvailabilityNotes(e.target.value)} placeholder="Add useful information about electricity supply." /></label></div> : null}</section> : null}

      {step === 9 ? <section className="auth-step"><h2>Nearby Amenities</h2><p className="small-note">Which of these amenities are close to your office? Select all that apply. You will enter the distances on the next step.</p><div className="nearby-grid">{OFFICE_NEARBY_PLACES.map((item) => <label key={item.id} className="field-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem'}}><input type="checkbox" checked={selectedNearbyPlaces[item.id]} onChange={(e) => setSelectedNearbyPlaces((current) => ({ ...current, [item.id]: e.target.checked }))} style={{width: 'auto'}} />{item.label}</label>)}</div></section> : null}

      {step === 10 ? <section className="auth-step"><h2>Amenity Distances</h2><p className="small-note">Enter the approximate distance for each selected amenity. Use metres or walking time.</p><div className="nearby-grid">{OFFICE_NEARBY_PLACES.filter((item) => selectedNearbyPlaces[item.id]).map((item) => <div key={item.id} style={{marginBottom: '0.75rem'}}><label className="field-label">{item.label}<input style={{marginTop: '0.25rem'}} value={nearbyPlaces[item.id]} onChange={(e) => setNearbyPlaces((current) => ({ ...current, [item.id]: e.target.value }))} placeholder="e.g. 200m or 3 minutes walk" /></label></div>)}</div>{OFFICE_NEARBY_PLACES.filter((item) => selectedNearbyPlaces[item.id]).length === 0 ? <p className="auth-message">No amenities were selected. You can go back to select some or skip this step.</p> : null}</section> : null}

      {step === 11 ? <section className="auth-step"><h2>Property Photos</h2><div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}><span className="badge">Required: Entrance Photo</span><p className="small-note" style={{marginTop: '0.5rem'}}>Upload a clear photo of the main office entrance. This helps customers identify the property.</p><label className="field-label">Entrance photo<input type="file" accept="image/*" multiple onChange={(e) => selectEntrancePhotos(e.target.files)} /></label><ul className="photo-guidance-list"><li>Main entrance or gate</li><li>Entrance showing the office building name or number if visible</li></ul>{entrancePhotoNames.length ? <ul className="uploaded-photo-list">{entrancePhotoNames.map((name) => <li key={name}>{name}</li>)}</ul> : null}</div><div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}><span className="badge">Required: Whole Building Photo</span><p className="small-note" style={{marginTop: '0.5rem'}}>Upload a photo showing the entire building exterior. This helps customers see the full property and surroundings.</p><label className="field-label">Whole building photo<input type="file" accept="image/*" multiple onChange={(e) => selectBuildingExteriorPhotos(e.target.files)} /></label><ul className="photo-guidance-list"><li>Building exterior from the street</li><li>Shared areas (corridors, reception) where applicable</li></ul>{buildingExteriorPhotoNames.length ? <ul className="uploaded-photo-list">{buildingExteriorPhotoNames.map((name) => <li key={name}>{name}</li>)}</ul> : null}</div>{hasVacantOfficeUnits === 'yes' && parsedUnitIdentifiers.length > 0 ? <div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}><span className="badge" style={{background: 'var(--info-bg, #eff6ff)', color: 'var(--info-text, #1e40af)'}}>Note: Vacant Unit Photos</span><p className="small-note" style={{marginTop: '0.5rem'}}>After the admin approves your listing, you will be prompted to upload photos for each individual vacant office unit. Each unit needs its own photos since conditions may differ even if units look similar.</p></div> : null}<label className="field-label">Property Description<textarea className="large-description-field" rows={7} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the office, access, surroundings, building condition and suitability. Avoid exaggerated marketing language." />{errors.description ? <span>{errors.description}</span> : null}</label><fieldset className="selection-fieldset"><legend>Registration relationship</legend><label><input type="radio" name="officeOwnershipRole" checked={ownershipRole === 'owner'} onChange={() => setOwnershipRole('owner')} /> I am the Owner</label><label><input type="radio" name="officeOwnershipRole" checked={ownershipRole === 'property-manager'} onChange={() => setOwnershipRole('property-manager')} /> I am the Property Manager</label><label><input type="radio" name="officeOwnershipRole" checked={ownershipRole === 'leasing-agent'} onChange={() => setOwnershipRole('leasing-agent')} /> I am the Leasing Agent</label></fieldset></section> : null}

      {step === 13 ? (
        <section className="auth-step"><h2>WhatsApp Contacts</h2><p className="small-note">Provide WhatsApp numbers for key contacts. The property manager's number receives most notifications about the listing, vacancies, and customer activity.</p>
          {whatsappContacts.map((contact, index) => (
            <div className="house-vacancy-card" key={`whatsapp-${index}`} style={{marginBottom: '1rem'}}>
              <fieldset className="selection-fieldset"><legend>Contact Role</legend><label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'property-manager'} onChange={() => updateWhatsAppContact(index, { role: 'property-manager' })} /> Property Manager</label><label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'owner'} onChange={() => updateWhatsAppContact(index, { role: 'owner' })} /> Owner</label><label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'leasing-agent'} onChange={() => updateWhatsAppContact(index, { role: 'leasing-agent' })} /> Leasing Agent</label></fieldset>
              <label className="field-label">Full Name<input value={contact.fullName} onChange={(e) => updateWhatsAppContact(index, { fullName: e.target.value })} placeholder="Contact full name" /></label>
              <label className="field-label">WhatsApp Number<input value={contact.whatsappNumber} onChange={(e) => updateWhatsAppContact(index, { whatsappNumber: e.target.value })} placeholder="For example +254 712 345 678" />{errors[`whatsapp-${index}`] ? <span>{errors[`whatsapp-${index}`]}</span> : null}</label>
              {whatsappContacts.length > 1 ? <button type="button" className="secondary-action" onClick={() => removeWhatsAppContact(index)}>Remove</button> : null}
            </div>
          ))}
          {whatsappContacts.length < 3 ? <button type="button" className="secondary-action" onClick={addWhatsAppContact}>Add Another Contact</button> : null}
          <p className="small-note" style={{marginTop: '1rem'}}>You can add up to 3 contacts: the Property Manager, Owner, and Leasing Agent. The Property Manager's WhatsApp number will receive listing notifications, vacancy updates, and customer activity alerts.</p>
        </section>
      ) : null}

      <div className="auth-actions">{step > 1 ? <button type="button" className="secondary-action" onClick={() => setStep(step - 1)}>Back</button> : null}{step < totalSteps ? <button type="button" className="primary-action" onClick={() => setStep(step + 1)}>Continue</button> : null}<LoadingButton loading={savingAction === 'save-draft'} loadingText="Saving draft..." className="secondary-action" onClick={() => save('save-draft')}>Save as Draft</LoadingButton><LoadingButton loading={savingAction === 'save-draft'} loadingText="Saving..." className="secondary-action" onClick={() => save('save-draft')}>Continue Later</LoadingButton>{step === totalSteps ? <LoadingButton loading={savingAction === 'submit-registration'} loadingText="Submitting..." className="primary-action" onClick={() => save('submit-registration')}>Submit Registration</LoadingButton> : null}</div>
      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
    </section>
  );
}

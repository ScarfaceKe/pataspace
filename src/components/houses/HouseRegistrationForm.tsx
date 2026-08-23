'use client';

import { PropertyLocationVerificationStep } from '@/components/properties/PropertyLocationVerificationStep';
import { ListingWhatsAppSupport } from '@/components/support/ListingWhatsAppSupport';
import type { PropertyLocationVerification } from '@/domain/location-verification';
import { useMemo, useState } from 'react';
import { LoadingButton } from '@/components/system/InlineSpinner';
import { KENYA_COUNTIES, KNOWN_KENYA_LOCATION_TERMS } from '@/domain/kenya-location-intelligence';
import {
  DEPOSIT_STRUCTURES,
  HOUSE_REGISTRATION_FOUNDATION,
  NEARBY_PLACES,
  RESIDENTIAL_CATEGORIES,
  WATER_AVAILABILITY_OPTIONS,
  getAllowedVacancyCategories,
  waterHasConnection,
  type DepositStructureId,
  type NearbyPlaceId,
  type ResidentialCategoryId,
  type WaterAvailabilityId,
  type WaterRentInclusion
} from '@/domain/house-registration';
import type { PropertyOwnershipRole, PropertyRegistrationAction, AdditionalFloorLocationId } from '@/domain/property-registration';
import { getRegistrationResponsibilityCopy, getFloorCountWithGroundFloor, ADDITIONAL_FLOOR_LOCATIONS } from '@/domain/property-registration';
import type { UserRoleId } from '@/domain/types';
import { summarizeImageUploadResults, uploadPropertyImageFiles } from '@/components/properties/propertyImageUploadClient';

interface VacancyDraft {
  residentialCategory: ResidentialCategoryId;
  monthlyRent: string;
  depositAmount: string;
  quantityAvailable: string;
  unitIdentifiers: string;
}

interface WhatsAppContactDraft {
  whatsappNumber: string;
  role: PropertyOwnershipRole;
  fullName: string;
}

interface HouseRegistrationFormProps {
  profileRole: UserRoleId;
}

const totalSteps = 12;

function toNumberOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function HouseRegistrationForm({ profileRole }: HouseRegistrationFormProps) {
  const defaultOwnership: PropertyOwnershipRole =
    profileRole === 'property-owner' ? 'owner' : profileRole === 'leasing-agent' ? 'leasing-agent' : 'property-manager';
  const [step, setStep] = useState(1);
  const [locationVerification, setLocationVerification] = useState<PropertyLocationVerification | undefined>();
  const [residentialCategory, setResidentialCategory] = useState<ResidentialCategoryId>('bedsitter');
  const [county, setCounty] = useState('');
  const [townOrCity, setTownOrCity] = useState('');
  const [estateOrAreaOrNeighbourhood, setEstateOrAreaOrNeighbourhood] = useState('');
  const [landmark, setLandmark] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [numberOfUnits, setNumberOfUnits] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState('');
  const [hasBasement, setHasBasement] = useState(false);
  const [hasMezzanine, setHasMezzanine] = useState(false);
  const [hasRooftop, setHasRooftop] = useState(false);
  const [vacantUnitFloor, setVacantUnitFloor] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [depositStructure, setDepositStructure] = useState<DepositStructureId>('one-month');
  const [depositAmount, setDepositAmount] = useState('');
  const [hasVacantUnits, setHasVacantUnits] = useState<'yes' | 'no'>('yes');
  const [vacancies, setVacancies] = useState<VacancyDraft[]>([
    { residentialCategory: 'bedsitter', monthlyRent: '', depositAmount: '', quantityAvailable: '1', unitIdentifiers: '' }
  ]);
  const [waterAvailability, setWaterAvailability] = useState<WaterAvailabilityId>('daily-water');
  const [specificDays, setSpecificDays] = useState('');
  const [waterRentInclusion, setWaterRentInclusion] = useState<WaterRentInclusion>('included');
  const [isElectricityAvailable, setIsElectricityAvailable] = useState<'yes' | 'no'>('yes');
  const [electricityBillingType, setElectricityBillingType] = useState<'individual-meter' | 'shared-meter' | 'included-in-rent' | 'other'>('individual-meter');
  const [electricityOtherBilling, setElectricityOtherBilling] = useState('');
  const [powerAvailabilityNotes, setPowerAvailabilityNotes] = useState('');
  const [selectedNearbyPlaces, setSelectedNearbyPlaces] = useState<Record<NearbyPlaceId, boolean>>({
    'primary-school': false,
    'secondary-school': false,
    hospital: false,
    'shopping-centre': false,
    'bus-stage': false,
    market: false,
    'police-station': false
  });
  const [nearbyPlaces, setNearbyPlaces] = useState<Record<NearbyPlaceId, string>>({
    'primary-school': '',
    'secondary-school': '',
    hospital: '',
    'shopping-centre': '',
    'bus-stage': '',
    market: '',
    'police-station': ''
  });
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

  const allowedVacancyCategories = useMemo(() => getAllowedVacancyCategories(residentialCategory), [residentialCategory]);

  const parsedFloorCount = useMemo(() => getFloorCountWithGroundFloor(toNumberOrNull(numberOfFloors)), [numberOfFloors]);

  function updateVacancy(index: number, updates: Partial<VacancyDraft>) {
    setVacancies((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...updates } : item)));
  }

  function addVacancy() {
    const nextCategory = allowedVacancyCategories[0]?.id ?? residentialCategory;
    setVacancies((current) => [...current, { residentialCategory: nextCategory, monthlyRent: '', depositAmount: '', quantityAvailable: '1', unitIdentifiers: '' }]);
  }

  function removeVacancy(index: number) {
    setVacancies((current) => current.filter((_, itemIndex) => itemIndex !== index));
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
    setMessage(action === 'save-draft' ? 'Saving your residential draft...' : 'Submitting residential property...');

    const response = await fetch('/api/houses/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        residentialCategory,
        location: { county, townOrCity, estateOrAreaOrNeighbourhood, landmark, verification: locationVerification },
        propertyName,
        unitNumber,
        numberOfUnits: toNumberOrNull(numberOfUnits),
        numberOfFloors: toNumberOrNull(numberOfFloors),
        additionalFloorLocations: [
          ...(hasBasement ? ['basement'] as const : []),
          ...(hasMezzanine ? ['mezzanine'] as const : []),
          ...(hasRooftop ? ['rooftop'] as const : []),
        ],
        vacantUnitFloor: toNumberOrNull(vacantUnitFloor),
        rent: { monthlyRent: toNumberOrNull(monthlyRent), depositStructure, depositAmount: toNumberOrNull(depositAmount) },
        hasVacantUnits,
        vacancies: hasVacantUnits === 'yes'
          ? vacancies.map((vacancy) => ({
              residentialCategory: vacancy.residentialCategory,
              monthlyRent: toNumberOrNull(vacancy.monthlyRent) || toNumberOrNull(monthlyRent),
              depositAmount: toNumberOrNull(vacancy.depositAmount) || toNumberOrNull(depositAmount),
              quantityAvailable: toNumberOrNull(vacancy.quantityAvailable),
              unitIdentifiers: vacancy.unitIdentifiers.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean)
            }))
          : [],
        water: {
          availability: waterAvailability,
          specificDays,
          rentInclusion: waterHasConnection(waterAvailability) ? waterRentInclusion : undefined
        },
        electricity: {
          isElectricityAvailable,
          billingType: isElectricityAvailable === 'yes' ? electricityBillingType : undefined,
          otherBillingDescription: electricityBillingType === 'other' ? electricityOtherBilling : undefined,
          powerAvailabilityNotes
        },
        nearbyPlaces: Object.entries(nearbyPlaces)
          .filter(([id, approximateDistance]) => selectedNearbyPlaces[id as NearbyPlaceId] && approximateDistance.trim())
          .map(([place, approximateDistance]) => ({ place, approximateDistance })),
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
    if (!response.ok) {
      setErrors(result.fieldErrors ?? {});
      setMessage(result.message ?? 'Please check the highlighted details and try again.');
      return;
    }
    let imageUploadSummary = '';
    const allPhotoFiles = [...entrancePhotoFiles, ...buildingExteriorPhotoFiles];
    if (result.house?.propertyFoundationId && allPhotoFiles.length) {
      const uploadResults = await uploadPropertyImageFiles({ propertyId: result.house.propertyFoundationId, files: allPhotoFiles, onProgress: setMessage });
      imageUploadSummary = summarizeImageUploadResults(uploadResults);
    }
    setMessage(
      action === 'submit-registration'
        ? `${HOUSE_REGISTRATION_FOUNDATION.successMessage} ${hasVacantUnits === 'yes' ? 'Your property has been registered. Once the admin approves your listing, you will be notified via WhatsApp to upload photos for each individual vacant unit. Each unit should have its own photos since conditions may differ even if units look similar.' : 'If vacancies do not exist, the property remains registered and vacancies can be published later.'}`
        : result.message
    );
    if (imageUploadSummary) setMessage((current) => `${current} ${imageUploadSummary}`);
    if (action === 'submit-registration' && result.ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="property-registration-card" aria-labelledby="house-registration-title">
        <div className="registration-success">
          <span className="success-icon">✅</span>
          <h2>Registration Submitted Successfully</h2>
          <p className="success-subtitle">Your residential property has been submitted and is now in the verification queue.</p>
          <div className="success-detail">
            <strong>What happens next:</strong>
            Your listing will be reviewed by our team. Once approved, it will appear in customer search results. {hasVacantUnits === 'yes' ? 'You will be notified via WhatsApp to upload photos for each individual vacant unit after approval.' : ''}You can track the status from your dashboard.
          </div>
          <div className="success-actions">
            <a className="primary-action" href="/dashboard">Go to Dashboard</a>
            <a className="secondary-action" href="/properties/register/house">Register Another House</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="property-registration-card" aria-labelledby="house-registration-title">
      <div className="auth-header">
        <span className="section-eyebrow">House registration</span>
        <h1 id="house-registration-title">Register a residential property</h1>
        <p>{getRegistrationResponsibilityCopy(profileRole)} This guided foundation collects approved residential information only.</p>
      </div>

      <ListingWhatsAppSupport context="listing" />

      <div className="progress-steps" aria-label="House registration progress">
        {Array.from({ length: totalSteps }, (_, index) => index + 1).map((item) => (
          <button key={item} type="button" className={step === item ? 'step active' : 'step'} onClick={() => setStep(item)} aria-current={step === item ? 'step' : undefined}>{item}</button>
        ))}
      </div>

      {step === 1 ? (
        <section className="auth-step" aria-labelledby="residential-category-title">
          <h2 id="residential-category-title">What type of residential property are you registering?</h2>
          <div className="property-category-grid">
            {RESIDENTIAL_CATEGORIES.map((item) => (
              <button key={item.id} type="button" className={residentialCategory === item.id ? 'property-category-card active' : 'property-category-card'} onClick={() => {
                setResidentialCategory(item.id);
                setVacancies([{ residentialCategory: item.id === 'mixed-residential-property' ? 'single-room' : item.id, monthlyRent: '', depositAmount: '', quantityAvailable: '1', unitIdentifiers: '' }]);
              }} aria-pressed={residentialCategory === item.id}>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
          {errors.residentialCategory ? <p className="field-error">{errors.residentialCategory}</p> : null}
        </section>
      ) : null}

      {step === 2 ? (
        <section className="auth-step" aria-labelledby="house-location-title">
          <h2 id="house-location-title">Property Location</h2>
          <label className="field-label">County
            <input list="kenya-counties" value={county} onChange={(event) => setCounty(event.target.value)} placeholder="Nairobi" />
            {errors.county ? <span>{errors.county}</span> : null}
          </label>
          <label className="field-label">Town / City
            <input list="known-kenya-locations" value={townOrCity} onChange={(event) => setTownOrCity(event.target.value)} placeholder="Nairobi" />
            {errors.townOrCity ? <span>{errors.townOrCity}</span> : null}
          </label>
          <label className="field-label">Estate / Neighbourhood
            <input list="known-kenya-locations" value={estateOrAreaOrNeighbourhood} onChange={(event) => setEstateOrAreaOrNeighbourhood(event.target.value)} placeholder="Kilimani" />
            {errors.estateOrAreaOrNeighbourhood ? <span>{errors.estateOrAreaOrNeighbourhood}</span> : null}
          </label>
          <label className="field-label">Landmark (optional)
            <input value={landmark} onChange={(event) => setLandmark(event.target.value)} placeholder="Near a known landmark" />
          </label>

          <ListingWhatsAppSupport context="location" />
          <PropertyLocationVerificationStep
            value={locationVerification}
            onChange={setLocationVerification}
            onSuggestedAddress={(suggested) => {
              if (suggested.county && !county) setCounty(suggested.county);
              if (suggested.town && !townOrCity) setTownOrCity(suggested.town);
              if (suggested.estate && !estateOrAreaOrNeighbourhood) setEstateOrAreaOrNeighbourhood(suggested.estate);
              if (suggested.road && !landmark) setLandmark(suggested.road);
            }}
          />
          <datalist id="kenya-counties">{KENYA_COUNTIES.map((item) => <option key={item} value={item} />)}</datalist>
          <datalist id="known-kenya-locations">{KNOWN_KENYA_LOCATION_TERMS.map((item) => <option key={item} value={item} />)}</datalist>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="auth-step" aria-labelledby="house-info-title">
          <h2 id="house-info-title">Property Information</h2>
          <label className="field-label">Property Name (optional)
            <input value={propertyName} onChange={(event) => setPropertyName(event.target.value)} placeholder="Property or apartment name" />
          </label>
          <label className="field-label">Unit Number *
            <input value={unitNumber} onChange={(event) => setUnitNumber(event.target.value)} placeholder="For example A2, 001, K1, MO2" />
            <span className="small-note">Every listing must have a unique unit number for identification.</span>
            {errors.unitNumber ? <span>{errors.unitNumber}</span> : null}
          </label>
          <label className="field-label">Number of Units
            <input type="number" min="1" inputMode="numeric" value={numberOfUnits} onChange={(event) => setNumberOfUnits(event.target.value)} />
            {errors.numberOfUnits ? <span>{errors.numberOfUnits}</span> : null}
          </label>
          <label className="field-label">Number of Floors (if applicable)
            <input type="number" min="1" inputMode="numeric" value={numberOfFloors} onChange={(event) => setNumberOfFloors(event.target.value)} />
            {numberOfFloors ? <span className="small-note" style={{color: 'var(--text-secondary, #64748b)'}}>{parsedFloorCount}</span> : null}
            {errors.numberOfFloors ? <span>{errors.numberOfFloors}</span> : null}
          </label>
          <div style={{marginTop: '0.75rem'}}>
            <span className="field-label" style={{display: 'block', marginBottom: '0.5rem'}}>  Does this property have any of the following additional levels?
              <span style={{fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', display: 'block', fontWeight: 400, marginTop: '0.25rem'}}>
                Select all that apply. These levels will be permanently recorded with your listing.
              </span>
            </span>
            <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
              {ADDITIONAL_FLOOR_LOCATIONS.map((loc) => {
                const isActive = loc.id === 'basement' ? hasBasement : loc.id === 'mezzanine' ? hasMezzanine : hasRooftop;
                const toggle = loc.id === 'basement' ? setHasBasement : loc.id === 'mezzanine' ? setHasMezzanine : setHasRooftop;
                return (
                  <button key={loc.id} type="button" onClick={() => toggle(!isActive)}
                    style={{padding: '0.5rem 1rem', borderRadius: '9999px', border: isActive ? '2px solid var(--primary, #10b981)' : '2px solid var(--border, #e2e8f0)', background: isActive ? 'var(--primary-light, #ecfdf5)' : 'white', color: isActive ? 'var(--primary, #10b981)' : 'var(--text-secondary, #64748b)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s ease'}}>
                    {isActive ? '✓ ' : ''}{loc.label}
                  </button>
                );
              })}
            </div>
            {(hasBasement || hasMezzanine || hasRooftop) ? (
              <span className="small-note" style={{color: 'var(--primary, #10b981)', marginTop: '0.5rem', display: 'block'}}>
                These additional levels are now part of your property record and will appear in search results, match details, and listing information.
              </span>
            ) : null}
          </div>
          {hasVacantUnits === 'yes' ? (
            <label className="field-label">Floor where vacant unit exists (if applicable)
              <input type="number" min="0" inputMode="numeric" value={vacantUnitFloor} onChange={(event) => setVacantUnitFloor(event.target.value)} placeholder="Ground floor = 0" />
              <span className="small-note">You can also enter basement, mezzanine, or rooftop if applicable.</span>
              {errors.vacantUnitFloor ? <span>{errors.vacantUnitFloor}</span> : null}
            </label>
          ) : null}
        </section>
      ) : null}

      {step === 4 ? (
        <section className="auth-step" aria-labelledby="rent-info-title">
          <h2 id="rent-info-title">Rent Information</h2>
          <label className="field-label">Monthly Rent
            <input type="number" min="0" inputMode="numeric" value={monthlyRent} onChange={(event) => setMonthlyRent(event.target.value)} placeholder="Amount in KSh" />
            {errors.monthlyRent ? <span>{errors.monthlyRent}</span> : null}
          </label>
          <fieldset className="selection-fieldset">
            <legend>Deposit Amount</legend>
            {DEPOSIT_STRUCTURES.map((item) => (
              <label key={item.id}>
                <input type="radio" name="depositStructure" checked={depositStructure === item.id} onChange={() => setDepositStructure(item.id)} />
                {item.label}
              </label>
            ))}
          </fieldset>
          <label className="field-label">Deposit amount entered by owner, manager or leasing agent
            <input type="number" min="0" inputMode="numeric" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} placeholder="Do not restrict deposit values" />
            {errors.depositAmount ? <span>{errors.depositAmount}</span> : null}
          </label>
        </section>
      ) : null}

      {step === 5 ? (
        <section className="auth-step" aria-labelledby="vacancy-info-title">
          <h2 id="vacancy-info-title">Vacancy Information</h2>
          <fieldset className="selection-fieldset">
            <legend>Are there currently vacant units?</legend>
            <label><input type="radio" name="hasVacantUnits" checked={hasVacantUnits === 'yes'} onChange={() => setHasVacantUnits('yes')} /> Yes</label>
            <label><input type="radio" name="hasVacantUnits" checked={hasVacantUnits === 'no'} onChange={() => setHasVacantUnits('no')} /> No</label>
          </fieldset>
          {hasVacantUnits === 'no' ? <p className="auth-message">The residential property can be registered successfully without publishing vacancies.</p> : null}
          {hasVacantUnits === 'yes' ? (
            <div className="vacancy-foundation-panel">
              <span className="badge">Vacancy registration</span>
              <p className="small-note" style={{marginBottom: '1rem'}}>Rent and deposit values below are pre-filled from the property-level rent information. You can override them for individual units if needed, or leave them as-is when all units share the same pricing.</p>
              {vacancies.map((vacancy, index) => (
                <div className="house-vacancy-card" key={`${vacancy.residentialCategory}-${index}`}>
                  <label className="field-label">Residential Category
                    <select value={vacancy.residentialCategory} onChange={(event) => updateVacancy(index, { residentialCategory: event.target.value as ResidentialCategoryId })}>
                      {allowedVacancyCategories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </label>
                  <label className="field-label">Monthly Rent (auto-filled from property rent)
                    <input type="number" min="0" value={vacancy.monthlyRent || monthlyRent} onChange={(event) => updateVacancy(index, { monthlyRent: event.target.value })} placeholder={monthlyRent ? `Same as property rent: ${monthlyRent}` : 'Enter rent'} />
                  </label>
                  <label className="field-label">Deposit (auto-filled from property deposit)
                    <input type="number" min="0" value={vacancy.depositAmount || depositAmount} onChange={(event) => updateVacancy(index, { depositAmount: event.target.value })} placeholder={depositAmount ? `Same as property deposit: ${depositAmount}` : 'Enter deposit'} />
                  </label>
                  <label className="field-label">Quantity Available
                    <input type="number" min="1" value={vacancy.quantityAvailable} onChange={(event) => updateVacancy(index, { quantityAvailable: event.target.value })} />
                  </label>
                  <label className="field-label">Real-world unit identifiers
                    <textarea className="large-description-field" rows={3} value={vacancy.unitIdentifiers} onChange={(event) => updateVacancy(index, { unitIdentifiers: event.target.value })} placeholder="Enter each actual unit identifier exactly as it appears, for example A1, B5, Unit 12 or Room 7." />
                    {errors[`vacancy-${index}-unitIdentifiers`] ? <span>{errors[`vacancy-${index}-unitIdentifiers`]}</span> : null}
                  </label>
                  {vacancies.length > 1 ? <button type="button" className="secondary-action" onClick={() => removeVacancy(index)}>Remove</button> : null}
                </div>
              ))}
              {residentialCategory === 'mixed-residential-property' ? <button type="button" className="secondary-action" onClick={addVacancy}>Add another residential category</button> : null}
              {errors.vacancies ? <p className="field-error">{errors.vacancies}</p> : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {step === 6 ? (
        <section className="auth-step" aria-labelledby="water-info-title">
          <h2 id="water-info-title">Water Information</h2>
          <fieldset className="selection-fieldset">
            <legend>Water availability</legend>
            {WATER_AVAILABILITY_OPTIONS.map((item) => (
              <label key={item.id}><input type="radio" name="waterAvailability" checked={waterAvailability === item.id} onChange={() => setWaterAvailability(item.id)} /> {item.label}</label>
            ))}
          </fieldset>
          {waterAvailability === 'specific-days' ? (
            <label className="field-label">Which days is water available?
              <input value={specificDays} onChange={(event) => setSpecificDays(event.target.value)} placeholder="For example: Monday, Wednesday and Saturday" />
              {errors.specificDays ? <span>{errors.specificDays}</span> : null}
            </label>
          ) : null}
          {waterHasConnection(waterAvailability) ? (
            <fieldset className="selection-fieldset">
              <legend>Is water included in the rent?</legend>
              <label><input type="radio" name="waterRentInclusion" checked={waterRentInclusion === 'included'} onChange={() => setWaterRentInclusion('included')} /> Included</label>
              <label><input type="radio" name="waterRentInclusion" checked={waterRentInclusion === 'paid-separately'} onChange={() => setWaterRentInclusion('paid-separately')} /> Paid Separately</label>
            </fieldset>
          ) : null}
        </section>
      ) : null}

      {step === 7 ? (
        <section className="auth-step" aria-labelledby="electricity-title">
          <h2 id="electricity-title">Electricity Information</h2>
          <fieldset className="selection-fieldset">
            <legend>Is electricity available?</legend>
            <label><input type="radio" name="houseElectricity" checked={isElectricityAvailable === 'yes'} onChange={() => setIsElectricityAvailable('yes')} /> Yes</label>
            <label><input type="radio" name="houseElectricity" checked={isElectricityAvailable === 'no'} onChange={() => setIsElectricityAvailable('no')} /> No</label>
          </fieldset>
          {isElectricityAvailable === 'yes' ? (
            <div className="vacancy-foundation-panel">
              <fieldset className="selection-fieldset">
                <legend>How is electricity billed?</legend>
                <label><input type="radio" name="houseElectricityBilling" checked={electricityBillingType === 'individual-meter'} onChange={() => setElectricityBillingType('individual-meter')} /> Individual Meter</label>
                <label><input type="radio" name="houseElectricityBilling" checked={electricityBillingType === 'shared-meter'} onChange={() => setElectricityBillingType('shared-meter')} /> Shared Meter</label>
                <label><input type="radio" name="houseElectricityBilling" checked={electricityBillingType === 'included-in-rent'} onChange={() => setElectricityBillingType('included-in-rent')} /> Included in Rent</label>
                <label><input type="radio" name="houseElectricityBilling" checked={electricityBillingType === 'other'} onChange={() => setElectricityBillingType('other')} /> Other</label>
              </fieldset>
              {electricityBillingType === 'other' ? <label className="field-label">Briefly describe the billing arrangement<input value={electricityOtherBilling} onChange={(event) => setElectricityOtherBilling(event.target.value)} />{errors.electricityOtherBilling ? <span>{errors.electricityOtherBilling}</span> : null}</label> : null}
              <label className="field-label">Power availability notes, if necessary<textarea className="large-description-field" rows={3} value={powerAvailabilityNotes} onChange={(event) => setPowerAvailabilityNotes(event.target.value)} placeholder="Add useful information about electricity supply." /></label>
            </div>
          ) : null}
        </section>
      ) : null}

      {step === 8 ? (
        <section className="auth-step" aria-labelledby="nearby-select-title">
          <h2 id="nearby-select-title">Nearby Amenities</h2>
          <p className="small-note">Which of these amenities are close to your property? Select all that apply. You will enter the distances on the next step.</p>
          <div className="nearby-grid">
            {NEARBY_PLACES.map((item) => (
              <label key={item.id} className="field-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem'}}>
                <input type="checkbox" checked={selectedNearbyPlaces[item.id]} onChange={(event) => setSelectedNearbyPlaces((current) => ({ ...current, [item.id]: event.target.checked }))} style={{width: 'auto'}} />
                {item.label}
              </label>
            ))}
          </div>
        </section>
      ) : null}

      {step === 9 ? (
        <section className="auth-step" aria-labelledby="nearby-distance-title">
          <h2 id="nearby-distance-title">Amenity Distances</h2>
          <p className="small-note">Enter the approximate distance for each selected amenity. Use metres or walking time.</p>
          <div className="nearby-grid">
            {NEARBY_PLACES.filter((item) => selectedNearbyPlaces[item.id]).map((item) => (
              <div key={item.id} style={{marginBottom: '0.75rem'}}>
                <label className="field-label">
                  {item.label}
                  <input style={{marginTop: '0.25rem'}} value={nearbyPlaces[item.id]} onChange={(event) => setNearbyPlaces((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="e.g. 500m or 5 minutes walk" />
                </label>
              </div>
            ))}
          </div>
          {NEARBY_PLACES.filter((item) => selectedNearbyPlaces[item.id]).length === 0 ? <p className="auth-message">No amenities were selected. You can go back to select some or skip this step.</p> : null}
        </section>
      ) : null}

      {step === 10 ? (
        <section className="auth-step" aria-labelledby="house-photos-title">
          <h2 id="house-photos-title">Property Photos</h2>
          <div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}>
            <span className="badge">Required: Entrance Photo</span>
            <p className="small-note" style={{marginTop: '0.5rem'}}>Upload a clear photo of the main entrance to your property. This helps customers identify and locate the property.</p>
            <label className="field-label">Entrance photo
              <input type="file" accept="image/*" multiple onChange={(event) => selectEntrancePhotos(event.target.files)} />
            </label>
            <ul className="photo-guidance-list"><li>Main entrance or gate</li><li>Entrance showing the property number or name if visible</li></ul>
            {entrancePhotoNames.length ? <ul className="uploaded-photo-list">{entrancePhotoNames.map((name) => <li key={name}>{name}</li>)}</ul> : null}
          </div>
          <div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}>
            <span className="badge">Required: Whole Building Photo</span>
            <p className="small-note" style={{marginTop: '0.5rem'}}>Upload a photo showing the entire building exterior. This helps customers see the full property and its surroundings.</p>
            <label className="field-label">Whole building photo
              <input type="file" accept="image/*" multiple onChange={(event) => selectBuildingExteriorPhotos(event.target.files)} />
            </label>
            <ul className="photo-guidance-list"><li>Full building exterior from the street</li><li>Shared areas (corridors, stairways) where applicable</li></ul>
            {buildingExteriorPhotoNames.length ? <ul className="uploaded-photo-list">{buildingExteriorPhotoNames.map((name) => <li key={name}>{name}</li>)}</ul> : null}
          </div>
          {hasVacantUnits === 'yes' ? (
            <div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}>
              <span className="badge" style={{background: 'var(--info-bg, #eff6ff)', color: 'var(--info-text, #1e40af)'}}>Note: Vacant Unit Photos</span>
              <p className="small-note" style={{marginTop: '0.5rem'}}>After the admin approves your listing, you will be prompted to upload photos for each individual vacant unit. Each unit needs its own photos since conditions may differ even if units look similar.</p>
            </div>
          ) : null}
          <label className="field-label">Property Description
            <textarea className="large-description-field" rows={7} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Give accurate information about the property, location, surroundings and condition. Avoid exaggerated marketing language." />
            {errors.description ? <span>{errors.description}</span> : null}
          </label>
          <fieldset className="selection-fieldset">
            <legend>Registration relationship</legend>
            <label><input type="radio" name="ownershipRole" checked={ownershipRole === 'owner'} onChange={() => setOwnershipRole('owner')} /> I am the Owner</label>
            <label><input type="radio" name="ownershipRole" checked={ownershipRole === 'property-manager'} onChange={() => setOwnershipRole('property-manager')} /> I am the Property Manager</label>
            <label><input type="radio" name="ownershipRole" checked={ownershipRole === 'leasing-agent'} onChange={() => setOwnershipRole('leasing-agent')} /> I am the Leasing Agent</label>
          </fieldset>
        </section>
      ) : null}

      {step === 11 ? (
        <section className="auth-step" aria-labelledby="whatsapp-contacts-title">
          <h2 id="whatsapp-contacts-title">WhatsApp Contacts</h2>
          <p className="small-note">Provide WhatsApp numbers for key contacts. The property manager's number receives most notifications about the listing, vacancies, and customer activity.</p>
          {whatsappContacts.map((contact, index) => (
            <div className="house-vacancy-card" key={`whatsapp-${index}`} style={{marginBottom: '1rem'}}>
              <fieldset className="selection-fieldset">
                <legend>Contact Role</legend>
                <label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'property-manager'} onChange={() => updateWhatsAppContact(index, { role: 'property-manager' })} /> Property Manager</label>
                <label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'owner'} onChange={() => updateWhatsAppContact(index, { role: 'owner' })} /> Owner</label>
                <label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'leasing-agent'} onChange={() => updateWhatsAppContact(index, { role: 'leasing-agent' })} /> Leasing Agent</label>
              </fieldset>
              <label className="field-label">Full Name
                <input value={contact.fullName} onChange={(event) => updateWhatsAppContact(index, { fullName: event.target.value })} placeholder="Contact full name" />
              </label>
              <label className="field-label">WhatsApp Number
                <input value={contact.whatsappNumber} onChange={(event) => updateWhatsAppContact(index, { whatsappNumber: event.target.value })} placeholder="For example +254 712 345 678" />
                {errors[`whatsapp-${index}`] ? <span>{errors[`whatsapp-${index}`]}</span> : null}
              </label>
              {whatsappContacts.length > 1 ? <button type="button" className="secondary-action" onClick={() => removeWhatsAppContact(index)}>Remove</button> : null}
            </div>
          ))}
          {whatsappContacts.length < 3 ? <button type="button" className="secondary-action" onClick={addWhatsAppContact}>Add Another Contact</button> : null}
          <p className="small-note" style={{marginTop: '1rem'}}>You can add up to 3 contacts: the Property Manager, Owner, and Leasing Agent. The Property Manager's WhatsApp number will receive listing notifications, vacancy updates, and customer activity alerts.</p>
        </section>
      ) : null}

      <div className="auth-actions">
        {step > 1 ? <button type="button" className="secondary-action" onClick={() => setStep(step - 1)}>Back</button> : null}
        {step < totalSteps ? <button type="button" className="primary-action" onClick={() => setStep(step + 1)}>Continue</button> : null}
        <LoadingButton loading={savingAction === 'save-draft'} loadingText="Saving draft..." className="secondary-action" onClick={() => save('save-draft')}>Save as Draft</LoadingButton>
        <LoadingButton loading={savingAction === 'save-draft'} loadingText="Saving..." className="secondary-action" onClick={() => save('save-draft')}>Continue Later</LoadingButton>
        {step === totalSteps ? <LoadingButton loading={savingAction === 'submit-registration'} loadingText="Submitting..." className="primary-action" onClick={() => save('submit-registration')}>Submit Registration</LoadingButton> : null}
      </div>

      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
    </section>
  );
}

'use client';

import { PropertyLocationVerificationStep } from '@/components/properties/PropertyLocationVerificationStep';
import { ListingWhatsAppSupport } from '@/components/support/ListingWhatsAppSupport';
import type { PropertyLocationVerification } from '@/domain/location-verification';
import { useMemo, useState } from 'react';
import { KENYA_COUNTIES, KNOWN_KENYA_LOCATION_TERMS } from '@/domain/kenya-location-intelligence';
import { getRegistrationResponsibilityCopy, getFloorCountWithGroundFloor, ADDITIONAL_FLOOR_LOCATIONS, type PropertyOwnershipRole, type PropertyRegistrationAction, type AdditionalFloorLocationId } from '@/domain/property-registration';
import {
  BUSINESS_SUITABILITY_OPTIONS,
  COMMERCIAL_UNIT_TYPES,
  ROAD_VISIBILITY_OPTIONS,
  SHOP_DEPOSIT_STRUCTURES,
  SHOP_NEARBY_PLACES,
  SHOP_SIZE_OPTIONS,
  MAX_SHOP_TYPES,
  SHOP_REGISTRATION_FOUNDATION,
  SHOP_TYPES,
  SHOP_WATER_AVAILABILITY_OPTIONS,
  isMixedShopProperty,
  shopWaterHasConnection,
  type BusinessSuitabilityId,
  type CommercialUnitTypeId,
  type DepositStructureId,
  type RoadVisibilityId,
  type ShopNearbyPlaceId,
  type ShopPricingCategoryId,
  type ShopTypeId,
  type ShopWaterAvailabilityId,
  type ShopWaterRentInclusion
} from '@/domain/shop-registration';
import type { UserRoleId } from '@/domain/types';
import { summarizeImageUploadResults, uploadPropertyImageFiles } from '@/components/properties/propertyImageUploadClient';

interface WhatsAppContactDraft {
  whatsappNumber: string;
  role: PropertyOwnershipRole;
  fullName: string;
}

interface ShopRegistrationFormProps {
  profileRole: UserRoleId;
}

const totalSteps = 15;

function toNumberOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function ShopRegistrationForm({ profileRole }: ShopRegistrationFormProps) {
  const defaultOwnership: PropertyOwnershipRole =
    profileRole === 'property-owner' ? 'owner' : profileRole === 'leasing-agent' ? 'leasing-agent' : 'property-manager';
  const [step, setStep] = useState(1);
  const [locationVerification, setLocationVerification] = useState<PropertyLocationVerification | undefined>();
  const [shopSize, setShopSize] = useState<ShopPricingCategoryId>('medium-shop');
  const [shopTypes, setShopTypes] = useState<ShopTypeId[]>(['retail-shop']);
  const [commercialUnitType, setCommercialUnitType] = useState<CommercialUnitTypeId>('shop');
  const [customCommercialUnitType, setCustomCommercialUnitType] = useState('');
  const [mixedCommercialUnitTypes, setMixedCommercialUnitTypes] = useState<CommercialUnitTypeId[]>([]);
  const [county, setCounty] = useState('');
  const [townOrCity, setTownOrCity] = useState('');
  const [estateOrArea, setEstateOrArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [roadVisibility, setRoadVisibility] = useState<RoadVisibilityId>('facing-main-road');
  const [shopName, setShopName] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [numberOfShopUnits, setNumberOfShopUnits] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState('');
  const [hasBasement, setHasBasement] = useState(false);
  const [hasMezzanine, setHasMezzanine] = useState(false);
  const [hasRooftop, setHasRooftop] = useState(false);
  const [vacantShopFloor, setVacantShopFloor] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [depositStructure, setDepositStructure] = useState<DepositStructureId>('one-month');
  const [depositAmount, setDepositAmount] = useState('');
  const [hasVacantShopUnits, setHasVacantShopUnits] = useState<'yes' | 'no'>('yes');
  const [vacancyMonthlyRent, setVacancyMonthlyRent] = useState('');
  const [vacancyDepositStructure, setVacancyDepositStructure] = useState<DepositStructureId>('one-month');
  const [vacancyDepositAmount, setVacancyDepositAmount] = useState('');
  const [quantityAvailable, setQuantityAvailable] = useState('1');
  const [unitIdentifiers, setUnitIdentifiers] = useState('');
  const [waterAvailability, setWaterAvailability] = useState<ShopWaterAvailabilityId>('daily-water');
  const [specificDays, setSpecificDays] = useState('');
  const [waterRentInclusion, setWaterRentInclusion] = useState<ShopWaterRentInclusion>('included');
  const [isElectricityAvailable, setIsElectricityAvailable] = useState<'yes' | 'no'>('yes');
  const [electricityBillingType, setElectricityBillingType] = useState<'individual-meter' | 'shared-meter' | 'included-in-rent' | 'other'>('individual-meter');
  const [electricityOtherBilling, setElectricityOtherBilling] = useState('');
  const [powerAvailabilityNotes, setPowerAvailabilityNotes] = useState('');
  const [businessSuitability, setBusinessSuitability] = useState<BusinessSuitabilityId[]>([]);
  const [selectedNearbyPlaces, setSelectedNearbyPlaces] = useState<Record<ShopNearbyPlaceId, boolean>>({
    'bus-stage': false, market: false, 'main-road': false, 'shopping-centre': false, bank: false, hospital: false
  });
  const [nearbyPlaces, setNearbyPlaces] = useState<Record<ShopNearbyPlaceId, string>>({
    'bus-stage': '', market: '', 'main-road': '', 'shopping-centre': '', bank: '', hospital: ''
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

  const parsedUnitIdentifiers = useMemo(() => {
    if (hasVacantShopUnits !== 'yes') return [];
    return unitIdentifiers.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  }, [unitIdentifiers, hasVacantShopUnits]);

  const parsedFloorCount = useMemo(() => getFloorCountWithGroundFloor(toNumberOrNull(numberOfFloors)), [numberOfFloors]);

  function toggleShopType(id: ShopTypeId) {
    setShopTypes((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= MAX_SHOP_TYPES) return current;
      return [...current, id];
    });
  }

  function toggleMixedCommercialUnitType(id: CommercialUnitTypeId) {
    setMixedCommercialUnitTypes((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleBusiness(id: BusinessSuitabilityId) {
    setBusinessSuitability((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
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
    setMessage(action === 'save-draft' ? 'Saving your shop draft...' : 'Submitting shop property...');

    const response = await fetch('/api/shops/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },        body: JSON.stringify({
        shopSize,
        shopType: shopTypes,
        commercialUnitType: isMixedShopProperty(shopSize) ? mixedCommercialUnitTypes[0] ?? 'shop' : commercialUnitType,
        customCommercialUnitType,
        mixedCommercialUnitTypes: isMixedShopProperty(shopSize) ? mixedCommercialUnitTypes : undefined,
        pricingCategory: isMixedShopProperty(shopSize) ? 'medium-shop' : shopSize,
        location: { county, townOrCity, estateOrAreaOrNeighbourhood: estateOrArea, landmark, verification: locationVerification },
        roadVisibility,
        shopName,
        unitNumber,
        numberOfShopUnits: toNumberOrNull(numberOfShopUnits),
        numberOfFloors: toNumberOrNull(numberOfFloors),
        additionalFloorLocations: [
          ...(hasBasement ? ['basement'] as const : []),
          ...(hasMezzanine ? ['mezzanine'] as const : []),
          ...(hasRooftop ? ['rooftop'] as const : []),
        ],
        vacantShopFloor: toNumberOrNull(vacantShopFloor),
        rent: { monthlyRent: toNumberOrNull(monthlyRent), depositStructure, depositAmount: toNumberOrNull(depositAmount) },
        hasVacantShopUnits,
        vacancy: hasVacantShopUnits === 'yes' ? {
          monthlyRent: toNumberOrNull(vacancyMonthlyRent) || toNumberOrNull(monthlyRent),
          depositStructure: vacancyDepositStructure,
          depositAmount: toNumberOrNull(vacancyDepositAmount) || toNumberOrNull(depositAmount),
          quantityAvailable: toNumberOrNull(quantityAvailable),
          unitIdentifiers: unitIdentifiers.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean)
        } : undefined,
        water: {
          availability: waterAvailability,
          specificDays,
          rentInclusion: shopWaterHasConnection(waterAvailability) ? waterRentInclusion : undefined
        },
        electricity: {
          isElectricityAvailable,
          billingType: isElectricityAvailable === 'yes' ? electricityBillingType : undefined,
          otherBillingDescription: electricityBillingType === 'other' ? electricityOtherBilling : undefined,
          powerAvailabilityNotes
        },
        businessSuitability,
        nearbyPlaces: Object.entries(nearbyPlaces)
          .filter(([placeId, approximateDistance]) => selectedNearbyPlaces[placeId as ShopNearbyPlaceId] && approximateDistance.trim())
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
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      setMessage(result.message ?? 'Please check the highlighted details and try again.');
      return;
    }
    let imageUploadSummary = '';
    const allPhotoFiles = [...entrancePhotoFiles, ...buildingExteriorPhotoFiles];
    if (result.shop?.propertyFoundationId && allPhotoFiles.length) {
      const uploadResults = await uploadPropertyImageFiles({ propertyId: result.shop.propertyFoundationId, files: allPhotoFiles, onProgress: setMessage });
      imageUploadSummary = summarizeImageUploadResults(uploadResults);
    }
    setMessage(
      action === 'submit-registration'
        ? `${SHOP_REGISTRATION_FOUNDATION.successMessage} ${hasVacantShopUnits === 'yes' ? 'Your shop has been registered. Once the admin approves your listing, you will be notified via WhatsApp to upload photos for each individual vacant unit. Each unit needs its own photos since conditions may differ even if units look similar.' : 'If vacancies do not exist, the shop remains registered until vacancies are published.'}`
        : result.message
    );
    if (imageUploadSummary) setMessage((current) => `${current} ${imageUploadSummary}`);
  }

  return (
    <section className="property-registration-card" aria-labelledby="shop-registration-title">
      <div className="auth-header">
        <span className="section-eyebrow">Shop registration</span>
        <h1 id="shop-registration-title">Register a commercial shop space</h1>
        <p>{getRegistrationResponsibilityCopy(profileRole)} This guided workflow collects approved shop information only.</p>
      </div>

      <ListingWhatsAppSupport context="listing" />

      <div className="progress-steps" aria-label="Shop registration progress">
        {Array.from({ length: totalSteps }, (_, index) => index + 1).map((item) => (
          <button key={item} type="button" className={step === item ? 'step active' : 'step'} onClick={() => setStep(item)} aria-current={step === item ? 'step' : undefined}>{item}</button>
        ))}
      </div>

      {/* Step 1: Shop Size — Simple, user-friendly, hides internal Pricing Category logic */}
      {step === 1 ? (
        <section className="auth-step" aria-labelledby="shop-size-title">
          <h2 id="shop-size-title">How big is your shop?</h2>
          <p className="small-note">Select the size that best describes your shop space. This helps us show it to the right customers.</p>
          <div className="property-category-grid">
            {SHOP_SIZE_OPTIONS.map((item) => (
              <button key={item.id} type="button" className={shopSize === item.id ? 'property-category-card active' : 'property-category-card'} onClick={() => setShopSize(item.id)} aria-pressed={shopSize === item.id}>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
          <p className="small-note" style={{marginTop: '0.75rem', opacity: 0.6}}>{isMixedShopProperty(shopSize) ? 'Mixed property — different commercial spaces in one building' : `Pricing Category: ${shopSize === 'small-shop' ? 'Small Shop' : shopSize === 'medium-shop' ? 'Medium Shop' : 'Large Shop'}`}</p>
          {errors.shopSize ? <p className="field-error">{errors.shopSize}</p> : null}
          {errors.pricingCategory ? <p className="field-error">{errors.pricingCategory}</p> : null}
        </section>
      ) : null}

      {/* Step 2: Commercial Unit Type Identification — Simplified, plain language */}
      {step === 2 ? (
        <section className="auth-step" aria-labelledby="commercial-unit-type-title">
          <h2 id="commercial-unit-type-title">What kind of commercial space is this?</h2>
          {isMixedShopProperty(shopSize) ? (
            <>
              <p className="small-note">Your building has different types of commercial spaces. Select <strong>all</strong> that exist in your property.</p>
              <div className="business-toggle-grid">
                {COMMERCIAL_UNIT_TYPES.map((item) => (
                  <button key={item.id} type="button" className={mixedCommercialUnitTypes.includes(item.id) ? 'business-toggle active' : 'business-toggle'} onClick={() => toggleMixedCommercialUnitType(item.id)} aria-pressed={mixedCommercialUnitTypes.includes(item.id)}>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </button>
                ))}
              </div>
              <p className="small-note" style={{marginTop: '0.5rem'}}>{mixedCommercialUnitTypes.length} of {COMMERCIAL_UNIT_TYPES.length} selected</p>
              {mixedCommercialUnitTypes.length === 0 ? <p className="field-error">Please select at least one commercial unit type.</p> : null}
            </>
          ) : (
            <>
              <p className="small-note">What does the space look like? Choose the option that best describes the layout and size of your shop.</p>
              <div className="business-toggle-grid">
                {COMMERCIAL_UNIT_TYPES.map((item) => (
                  <button key={item.id} type="button" className={commercialUnitType === item.id ? 'business-toggle active' : 'business-toggle'} onClick={() => setCommercialUnitType(item.id)} aria-pressed={commercialUnitType === item.id}>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </button>
                ))}
              </div>
              {commercialUnitType === 'other-commercial-unit-type' ? (
                <label className="field-label">Custom commercial unit type
                  <input value={customCommercialUnitType} onChange={(event) => setCustomCommercialUnitType(event.target.value)} placeholder="Enter the commercial unit type" />
                  {errors.customCommercialUnitType ? <span>{errors.customCommercialUnitType}</span> : null}
                </label>
              ) : null}
            </>
          )}
          {errors.commercialUnitType ? <p className="field-error">{errors.commercialUnitType}</p> : null}
        </section>
      ) : null}

      {/* Step 3: Shop Type — Max 2 selections */}
      {step === 3 ? (
        <section className="auth-step" aria-labelledby="shop-type-title">
          <h2 id="shop-type-title">What type of shop are you registering?</h2>
          <p className="small-note">Choose one or two options that best describe the kind of business this shop will run. You may select up to {MAX_SHOP_TYPES}.</p>
          <div className="property-category-grid">
            {SHOP_TYPES.map((item) => (
              <button key={item.id} type="button" className={shopTypes.includes(item.id) ? 'property-category-card active' : 'property-category-card'} onClick={() => toggleShopType(item.id)} aria-pressed={shopTypes.includes(item.id)}>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
          <p className="small-note" style={{marginTop: '0.5rem'}}>{shopTypes.length} of {MAX_SHOP_TYPES} selected</p>
          {errors.shopType ? <p className="field-error">{errors.shopType}</p> : null}
        </section>
      ) : null}

      {step === 4 ? (
        <section className="auth-step" aria-labelledby="shop-location-title">
          <h2 id="shop-location-title">Property Location</h2>
          <label className="field-label">County
            <input list="kenya-counties" value={county} onChange={(event) => setCounty(event.target.value)} placeholder="Nairobi" />
            {errors.county ? <span>{errors.county}</span> : null}
          </label>
          <label className="field-label">Town / City
            <input list="known-kenya-locations" value={townOrCity} onChange={(event) => setTownOrCity(event.target.value)} placeholder="Nairobi" />
            {errors.townOrCity ? <span>{errors.townOrCity}</span> : null}
          </label>
          <label className="field-label">Estate / Area
            <input list="known-kenya-locations" value={estateOrArea} onChange={(event) => setEstateOrArea(event.target.value)} placeholder="Westlands" />
            {errors.estateOrArea ? <span>{errors.estateOrArea}</span> : null}
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
              if (suggested.estate && !estateOrArea) setEstateOrArea(suggested.estate);
              if (suggested.road && !landmark) setLandmark(suggested.road);
            }}
          />
          <datalist id="kenya-counties">{KENYA_COUNTIES.map((item) => <option key={item} value={item} />)}</datalist>
          <datalist id="known-kenya-locations">{KNOWN_KENYA_LOCATION_TERMS.map((item) => <option key={item} value={item} />)}</datalist>
        </section>
      ) : null}

      {step === 5 ? (
        <section className="auth-step" aria-labelledby="road-visibility-title">
          <h2 id="road-visibility-title">Where is the shop located?</h2>
          <fieldset className="selection-fieldset">
            <legend>Road visibility</legend>
            {ROAD_VISIBILITY_OPTIONS.map((item) => (
              <label key={item.id}><input type="radio" name="roadVisibility" checked={roadVisibility === item.id} onChange={() => setRoadVisibility(item.id)} /> {item.label}</label>
            ))}
          </fieldset>
          {errors.roadVisibility ? <p className="field-error">{errors.roadVisibility}</p> : null}
        </section>
      ) : null}

      {step === 6 ? (
        <section className="auth-step" aria-labelledby="shop-info-title">
          <h2 id="shop-info-title">Shop Information</h2>
          <label className="field-label">Shop Name (optional)
            <input value={shopName} onChange={(event) => setShopName(event.target.value)} />
          </label>
          <label className="field-label">Unit Number *
            <input value={unitNumber} onChange={(event) => setUnitNumber(event.target.value)} placeholder="For example Shop 14, Stall 3, K7 or Unit 12" />
            <span className="small-note">Every listing must have a unique unit number for identification.</span>
            {errors.unitNumber ? <span>{errors.unitNumber}</span> : null}
          </label>
          <label className="field-label">Number of Shop Units
            <input type="number" min="1" inputMode="numeric" value={numberOfShopUnits} onChange={(event) => setNumberOfShopUnits(event.target.value)} />
            {errors.numberOfShopUnits ? <span>{errors.numberOfShopUnits}</span> : null}
          </label>
          <label className="field-label">Number of Floors (if applicable)
            <input type="number" min="1" inputMode="numeric" value={numberOfFloors} onChange={(event) => setNumberOfFloors(event.target.value)} />
            {numberOfFloors ? <span className="small-note" style={{color: 'var(--text-secondary, #64748b)'}}>{parsedFloorCount}</span> : null}
            {errors.numberOfFloors ? <span>{errors.numberOfFloors}</span> : null}
          </label>
          <div style={{marginTop: '0.75rem'}}>
            <span className="field-label" style={{display: 'block', marginBottom: '0.5rem'}}>  Does this property have any of the following additional levels?
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
                    {isActive ? '\u2713 ' : ''}{loc.label}
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
          {hasVacantShopUnits === 'yes' ? (
            <label className="field-label">Floor where vacant shop exists (if applicable)
              <input type="number" min="0" inputMode="numeric" value={vacantShopFloor} onChange={(event) => setVacantShopFloor(event.target.value)} placeholder="Ground floor = 0" />
              <span className="small-note">You can also enter basement, mezzanine, or rooftop if applicable.</span>
              {errors.vacantShopFloor ? <span>{errors.vacantShopFloor}</span> : null}
            </label>
          ) : null}
        </section>
      ) : null}

      {step === 7 ? (
        <section className="auth-step" aria-labelledby="shop-rent-title">
          <h2 id="shop-rent-title">Rent Information</h2>
          <label className="field-label">Monthly Rent
            <input type="number" min="0" inputMode="numeric" value={monthlyRent} onChange={(event) => setMonthlyRent(event.target.value)} placeholder="Amount in KSh" />
            {errors.monthlyRent ? <span>{errors.monthlyRent}</span> : null}
          </label>
          <fieldset className="selection-fieldset">
            <legend>Deposit Amount</legend>
            {SHOP_DEPOSIT_STRUCTURES.map((item) => (
              <label key={item.id}><input type="radio" name="depositStructure" checked={depositStructure === item.id} onChange={() => setDepositStructure(item.id)} /> {item.label}</label>
            ))}
          </fieldset>
          <label className="field-label">Deposit amount entered directly
            <input type="number" min="0" inputMode="numeric" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} placeholder="Any custom deposit amount" />
            {errors.depositAmount ? <span>{errors.depositAmount}</span> : null}
          </label>
        </section>
      ) : null}

      {step === 8 ? (
        <section className="auth-step" aria-labelledby="shop-vacancy-title">
          <h2 id="shop-vacancy-title">Vacancy Information</h2>
          <fieldset className="selection-fieldset">
            <legend>Are there currently vacant shop units?</legend>
            <label><input type="radio" name="hasVacantShopUnits" checked={hasVacantShopUnits === 'yes'} onChange={() => setHasVacantShopUnits('yes')} /> Yes</label>
            <label><input type="radio" name="hasVacantShopUnits" checked={hasVacantShopUnits === 'no'} onChange={() => setHasVacantShopUnits('no')} /> No</label>
          </fieldset>
          {hasVacantShopUnits === 'no' ? <p className="auth-message">The shop property can be registered without publishing vacancies.</p> : null}
          {hasVacantShopUnits === 'yes' ? (
            <div className="vacancy-foundation-panel">
              <span className="badge">Vacancy details</span>
              <p className="small-note" style={{marginBottom: '1rem'}}>Rent and deposit values below are pre-filled from the property-level rent information. Override only if a specific unit has different pricing.</p>
              <label className="field-label">Monthly Rent (auto-filled from property rent)
                <input type="number" min="0" inputMode="numeric" value={vacancyMonthlyRent || monthlyRent} onChange={(event) => setVacancyMonthlyRent(event.target.value)} placeholder={monthlyRent ? `Same as property rent: ${monthlyRent}` : 'Enter rent'} />
                {errors.vacancyMonthlyRent ? <span>{errors.vacancyMonthlyRent}</span> : null}
              </label>
              <fieldset className="selection-fieldset">
                <legend>Vacancy deposit</legend>
                {SHOP_DEPOSIT_STRUCTURES.map((item) => (
                  <label key={item.id}><input type="radio" name="vacancyDepositStructure" checked={vacancyDepositStructure === item.id} onChange={() => setVacancyDepositStructure(item.id)} /> {item.label}</label>
                ))}
              </fieldset>
              <label className="field-label">Deposit amount filled directly
                <input type="number" min="0" inputMode="numeric" value={vacancyDepositAmount || depositAmount} onChange={(event) => setVacancyDepositAmount(event.target.value)} placeholder={depositAmount ? `Same as property deposit: ${depositAmount}` : 'Enter deposit'} />
                {errors.vacancyDepositAmount ? <span>{errors.vacancyDepositAmount}</span> : null}
              </label>
              <label className="field-label">Quantity Available
                <input type="number" min="1" inputMode="numeric" value={quantityAvailable} onChange={(event) => setQuantityAvailable(event.target.value)} />
                {errors.quantityAvailable ? <span>{errors.quantityAvailable}</span> : null}
              </label>
              <label className="field-label">Real-world vacant shop identifiers
                <textarea className="large-description-field" rows={3} value={unitIdentifiers} onChange={(event) => setUnitIdentifiers(event.target.value)} placeholder="Enter each actual shop identifier exactly as it appears, for example Shop 14, Stall 3, K7 or Unit 12." />
                {errors.unitIdentifiers ? <span>{errors.unitIdentifiers}</span> : null}
              </label>
              {parsedUnitIdentifiers.length > 0 ? (
                <p className="small-note" style={{marginTop: '0.5rem'}}>
                  {parsedUnitIdentifiers.length} vacant unit{parsedUnitIdentifiers.length > 1 ? 's' : ''} detected: {parsedUnitIdentifiers.join(', ')}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {step === 9 ? (
        <section className="auth-step" aria-labelledby="shop-water-title">
          <h2 id="shop-water-title">Water Information</h2>
          <fieldset className="selection-fieldset">
            <legend>Water availability</legend>
            {SHOP_WATER_AVAILABILITY_OPTIONS.map((item) => (
              <label key={item.id}><input type="radio" name="shopWater" checked={waterAvailability === item.id} onChange={() => setWaterAvailability(item.id)} /> {item.label}</label>
            ))}
          </fieldset>
          {waterAvailability === 'specific-days' ? (
            <label className="field-label">Which days is water available?
              <input value={specificDays} onChange={(event) => setSpecificDays(event.target.value)} placeholder="For example: Monday, Wednesday and Saturday" />
              {errors.specificDays ? <span>{errors.specificDays}</span> : null}
            </label>
          ) : null}
          {shopWaterHasConnection(waterAvailability) ? (
            <fieldset className="selection-fieldset">
              <legend>Is water included in the rent?</legend>
              <label><input type="radio" name="shopWaterRentInclusion" checked={waterRentInclusion === 'included'} onChange={() => setWaterRentInclusion('included')} /> Included</label>
              <label><input type="radio" name="shopWaterRentInclusion" checked={waterRentInclusion === 'paid-separately'} onChange={() => setWaterRentInclusion('paid-separately')} /> Paid Separately</label>
            </fieldset>
          ) : null}
        </section>
      ) : null}

      {step === 10 ? (
        <section className="auth-step" aria-labelledby="shop-electricity-title">
          <h2 id="shop-electricity-title">Electricity Information</h2>
          <fieldset className="selection-fieldset"><legend>Is electricity available?</legend><label><input type="radio" name="shopElectricity" checked={isElectricityAvailable === 'yes'} onChange={() => setIsElectricityAvailable('yes')} /> Yes</label><label><input type="radio" name="shopElectricity" checked={isElectricityAvailable === 'no'} onChange={() => setIsElectricityAvailable('no')} /> No</label></fieldset>
          {isElectricityAvailable === 'yes' ? <div className="vacancy-foundation-panel"><fieldset className="selection-fieldset"><legend>How is electricity billed?</legend><label><input type="radio" name="shopElectricityBilling" checked={electricityBillingType === 'individual-meter'} onChange={() => setElectricityBillingType('individual-meter')} /> Individual Meter</label><label><input type="radio" name="shopElectricityBilling" checked={electricityBillingType === 'shared-meter'} onChange={() => setElectricityBillingType('shared-meter')} /> Shared Meter</label><label><input type="radio" name="shopElectricityBilling" checked={electricityBillingType === 'included-in-rent'} onChange={() => setElectricityBillingType('included-in-rent')} /> Included in Rent</label><label><input type="radio" name="shopElectricityBilling" checked={electricityBillingType === 'other'} onChange={() => setElectricityBillingType('other')} /> Other</label></fieldset>{electricityBillingType === 'other' ? <label className="field-label">Briefly describe the billing arrangement<input value={electricityOtherBilling} onChange={(event) => setElectricityOtherBilling(event.target.value)} />{errors.electricityOtherBilling ? <span>{errors.electricityOtherBilling}</span> : null}</label> : null}<label className="field-label">Power availability notes, if necessary<textarea className="large-description-field" rows={3} value={powerAvailabilityNotes} onChange={(event) => setPowerAvailabilityNotes(event.target.value)} placeholder="Add useful information about electricity supply." /></label></div> : null}
        </section>
      ) : null}

      {step === 11 ? (
        <section className="auth-step" aria-labelledby="business-suitability-title">
          <h2 id="business-suitability-title">Which businesses is the shop suitable for?</h2>
          <div className="business-toggle-grid">
            {BUSINESS_SUITABILITY_OPTIONS.map((item) => (
              <button key={item.id} type="button" className={businessSuitability.includes(item.id) ? 'business-toggle active' : 'business-toggle'} onClick={() => toggleBusiness(item.id)} aria-pressed={businessSuitability.includes(item.id)}>
                <strong>{item.label}</strong>
                <small>{item.example}</small>
              </button>
            ))}
          </div>
          {errors.businessSuitability ? <p className="field-error">{errors.businessSuitability}</p> : null}
        </section>
      ) : null}

      {step === 12 ? (
        <section className="auth-step" aria-labelledby="shop-nearby-select-title">
          <h2 id="shop-nearby-select-title">Nearby Amenities</h2>
          <p className="small-note">Which of these amenities are close to your shop? Select all that apply. You will enter the distances on the next step.</p>
          <div className="nearby-grid">
            {SHOP_NEARBY_PLACES.map((item) => (
              <label key={item.id} className="field-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem'}}>
                <input type="checkbox" checked={selectedNearbyPlaces[item.id]} onChange={(event) => setSelectedNearbyPlaces((current) => ({ ...current, [item.id]: event.target.checked }))} style={{width: 'auto'}} />
                {item.label}
              </label>
            ))}
          </div>
        </section>
      ) : null}

      {step === 13 ? (
        <section className="auth-step" aria-labelledby="shop-nearby-distance-title">
          <h2 id="shop-nearby-distance-title">Amenity Distances</h2>
          <p className="small-note">Enter the approximate distance for each selected amenity. Use metres or walking time.</p>
          <div className="nearby-grid">
            {SHOP_NEARBY_PLACES.filter((item) => selectedNearbyPlaces[item.id]).map((item) => (
              <div key={item.id} style={{marginBottom: '0.75rem'}}>
                <label className="field-label">
                  {item.label}
                  <input style={{marginTop: '0.25rem'}} value={nearbyPlaces[item.id]} onChange={(event) => setNearbyPlaces((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="e.g. 200m or 3 minutes walk" />
                </label>
              </div>
            ))}
          </div>
          {SHOP_NEARBY_PLACES.filter((item) => selectedNearbyPlaces[item.id]).length === 0 ? <p className="auth-message">No amenities were selected. You can go back to select some or skip this step.</p> : null}
        </section>
      ) : null}

      {step === 14 ? (
        <section className="auth-step" aria-labelledby="shop-photos-title">
          <h2 id="shop-photos-title">Property Photos</h2>
          <div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}>
            <span className="badge">Required: Entrance Photo</span>
            <p className="small-note" style={{marginTop: '0.5rem'}}>Upload a clear photo of the main entrance or shopfront. This helps customers identify the property.</p>
            <label className="field-label">Entrance photo
              <input type="file" accept="image/*" multiple onChange={(event) => selectEntrancePhotos(event.target.files)} />
            </label>
            <ul className="photo-guidance-list"><li>Shop entrance or storefront</li><li>Main entrance or gate</li></ul>
            {entrancePhotoNames.length ? <ul className="uploaded-photo-list">{entrancePhotoNames.map((name) => <li key={name}>{name}</li>)}</ul> : null}
          </div>
          <div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}>
            <span className="badge">Required: Whole Building Photo</span>
            <p className="small-note" style={{marginTop: '0.5rem'}}>Upload a photo showing the entire building exterior. This helps customers see the full property and surroundings.</p>
            <label className="field-label">Whole building photo
              <input type="file" accept="image/*" multiple onChange={(event) => selectBuildingExteriorPhotos(event.target.files)} />
            </label>
            <ul className="photo-guidance-list"><li>Shopfront or building exterior from the street</li><li>Shared areas (corridors, walkways) where applicable</li></ul>
            {buildingExteriorPhotoNames.length ? <ul className="uploaded-photo-list">{buildingExteriorPhotoNames.map((name) => <li key={name}>{name}</li>)}</ul> : null}
          </div>
          {hasVacantShopUnits === 'yes' && parsedUnitIdentifiers.length > 0 ? (
            <div className="vacancy-foundation-panel" style={{marginBottom: '1rem'}}>
              <span className="badge" style={{background: 'var(--info-bg, #eff6ff)', color: 'var(--info-text, #1e40af)'}}>Note: Vacant Unit Photos</span>
              <p className="small-note" style={{marginTop: '0.5rem'}}>After the admin approves your listing, you will be prompted to upload photos for each individual vacant shop unit. Each unit needs its own photos since conditions may differ even if units look similar.</p>
            </div>
          ) : null}
          <label className="field-label">Property Description
            <textarea className="large-description-field" rows={7} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Give accurate information about the shop, location, surroundings and condition. Avoid exaggerated marketing language." />
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

      {step === 15 ? (
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
        <button type="button" className="secondary-action" onClick={() => save('save-draft')} disabled={savingAction !== null}>{savingAction === 'save-draft' ? 'Saving draft...' : 'Save Draft'}</button>
        <button type="button" className="secondary-action" onClick={() => save('save-draft')} disabled={savingAction !== null}>Continue Later</button>
        {step === totalSteps ? <button type="button" className="primary-action" onClick={() => save('submit-registration')} disabled={savingAction !== null}>{savingAction === 'submit-registration' ? 'Submitting...' : 'Submit Registration'}</button> : null}
      </div>
      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
    </section>
  );
}

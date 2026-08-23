'use client';

import { useState } from 'react';
import { PropertyLocationVerificationStep } from '@/components/properties/PropertyLocationVerificationStep';
import { ListingWhatsAppSupport } from '@/components/support/ListingWhatsAppSupport';
import type { PropertyLocationVerification } from '@/domain/location-verification';
import {
  PROPERTY_DESCRIPTION_LABEL,
  PROPERTY_REGISTRATION_CATEGORIES,
  getRegistrationResponsibilityCopy,
  type PropertyOwnershipRole,
  type PropertyRegistrationCategoryId,
  type PropertyRegistrationAction,
  type PropertyVacancyAnswer
} from '@/domain/property-registration';
import type { UserRoleId } from '@/domain/types';
import { summarizeImageUploadResults, uploadPropertyImageFiles } from '@/components/properties/propertyImageUploadClient';

interface PropertyRegistrationFormProps {
  profileRole: UserRoleId;
}

type FieldErrors = Record<string, string>;

export function PropertyRegistrationForm({ profileRole }: PropertyRegistrationFormProps) {
  const defaultOwnership: PropertyOwnershipRole =
    profileRole === 'property-owner' ? 'owner' : profileRole === 'leasing-agent' ? 'leasing-agent' : 'property-manager';
  const [step, setStep] = useState(1);
  const [locationVerification, setLocationVerification] = useState<PropertyLocationVerification | undefined>();
  const [category, setCategory] = useState<PropertyRegistrationCategoryId>('houses');
  const [county, setCounty] = useState('');
  const [townOrCity, setTownOrCity] = useState('');
  const [estateOrAreaOrNeighbourhood, setEstateOrAreaOrNeighbourhood] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [ownershipRole, setOwnershipRole] = useState<PropertyOwnershipRole>(defaultOwnership);
  const [isElectricityAvailable, setIsElectricityAvailable] = useState<'yes' | 'no'>('yes');
  const [electricityBillingType, setElectricityBillingType] = useState<'individual-meter' | 'shared-meter' | 'included-in-rent' | 'other'>('individual-meter');
  const [electricityOtherBilling, setElectricityOtherBilling] = useState('');
  const [powerAvailabilityNotes, setPowerAvailabilityNotes] = useState('');
  const [ownerLinkName, setOwnerLinkName] = useState('');
  const [ownerLinkPhone, setOwnerLinkPhone] = useState('');
  const [managerLinkName, setManagerLinkName] = useState('');
  const [managerLinkPhone, setManagerLinkPhone] = useState('');
  const [agentLinkName, setAgentLinkName] = useState('');
  const [agentLinkPhone, setAgentLinkPhone] = useState('');
  const [hasVacantUnits, setHasVacantUnits] = useState<PropertyVacancyAnswer>('yes');
  const [vacancySummary, setVacancySummary] = useState('');
  const [unitsAvailable, setUnitsAvailable] = useState('');
  const [unitIdentifiers, setUnitIdentifiers] = useState('');
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');
  const [savingAction, setSavingAction] = useState<PropertyRegistrationAction | null>(null);

  async function save(action: PropertyRegistrationAction) {
    setSavingAction(action);
    setErrors({});
    setMessage(action === 'save-draft' ? 'Saving your draft...' : 'Submitting property registration...');

    const response = await fetch('/api/properties/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        location: { county, townOrCity, estateOrAreaOrNeighbourhood, street, landmark, verification: locationVerification },
        description,
        ownershipRole,
        electricity: {
          isElectricityAvailable,
          billingType: isElectricityAvailable === 'yes' ? electricityBillingType : undefined,
          otherBillingDescription: electricityBillingType === 'other' ? electricityOtherBilling : undefined,
          powerAvailabilityNotes
        },
        responsibilityLinks: {
          propertyOwner: { fullName: ownerLinkName, phoneNumber: ownerLinkPhone },
          propertyManager: { fullName: managerLinkName, phoneNumber: managerLinkPhone },
          leasingAgent: { fullName: agentLinkName, phoneNumber: agentLinkPhone }
        },
        hasVacantUnits,
        vacancy:
          hasVacantUnits === 'yes'
            ? {
                summary: vacancySummary,
                unitsAvailable: unitsAvailable ? Number(unitsAvailable) : undefined,
                unitIdentifiers: unitIdentifiers.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean)
              }
            : undefined,
        photos: photoNames.map((fileName) => ({ fileName })),
        action
      })
    });

    const result = await response.json();
    setSavingAction(null);

    if (!response.ok) {
      setErrors(result.fieldErrors ?? {});
      setMessage(result.message ?? 'Please check the property details and try again.');
      return;
    }

    let imageUploadSummary = '';
    if (result.property?.id && photoFiles.length) {
      const uploadResults = await uploadPropertyImageFiles({ propertyId: result.property.id, files: photoFiles, onProgress: setMessage });
      imageUploadSummary = summarizeImageUploadResults(uploadResults);
    }

    setMessage(`${result.message === 'Property successfully registered.' ? 'Property successfully registered.' : result.message}${imageUploadSummary ? ` ${imageUploadSummary}` : ''}`);
  }

  function onPhotoSelection(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    setPhotoFiles(files);
    setPhotoNames(files.map((file) => file.name));
  }

  return (
    <section className="property-registration-card" aria-labelledby="property-registration-title">
      <div className="auth-header">
        <span className="section-eyebrow">Property registration</span>
        <h1 id="property-registration-title">Register a rental property</h1>
        <p>
          Add high-quality property information through a guided, step-by-step workflow. Future property-specific
          prompts will extend this foundation without replacing it.
        </p>
      </div>
      <ListingWhatsAppSupport context="listing" />

      <div className="progress-steps" aria-label="Property registration progress">
        {[1, 2, 3, 4].map((item) => (
          <button
            key={item}
            type="button"
            className={step === item ? 'step active' : 'step'}
            onClick={() => setStep(item)}
            aria-current={step === item ? 'step' : undefined}
          >
            {item}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <section className="auth-step" aria-labelledby="property-category-title">
          <h2 id="property-category-title">What would you like to register?</h2>
          <div className="property-category-grid">
            {PROPERTY_REGISTRATION_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={category === item.id ? 'property-category-card active' : 'property-category-card'}
                onClick={() => setCategory(item.id)}
                aria-pressed={category === item.id}
              >
                <span aria-hidden="true">{item.icon}</span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
          {category === 'houses' ? (
            <a className="primary-action" href="/properties/register/house">Continue to House Registration</a>
          ) : null}
          {category === 'shops' ? (
            <a className="primary-action" href="/properties/register/shop">Continue to Shop Registration</a>
          ) : null}
          {category === 'offices' ? (
            <a className="primary-action" href="/properties/register/office">Continue to Office Registration</a>
          ) : null}
          {category === 'event-halls' ? (
            <a className="primary-action" href="/properties/register/event-hall">Continue to Event Hall Registration</a>
          ) : null}
          {errors.category ? <p className="field-error">{errors.category}</p> : null}
        </section>
      ) : null}

      {step === 2 ? (
        <section className="auth-step" aria-labelledby="property-location-title">
          <h2 id="property-location-title">Where is the property?</h2>
          <p className="small-note">
            PataSpace supports locations across Kenya. New or growing areas are accepted and quietly reviewed in the
            background where needed.
          </p>
          <label className="field-label">
            County
            <input value={county} onChange={(event) => setCounty(event.target.value)} placeholder="Nairobi" />
            {errors.county ? <span>{errors.county}</span> : null}
          </label>
          <label className="field-label">
            Town / City
            <input value={townOrCity} onChange={(event) => setTownOrCity(event.target.value)} placeholder="Nairobi" />
            {errors.townOrCity ? <span>{errors.townOrCity}</span> : null}
          </label>
          <label className="field-label">
            Estate / Area / Neighbourhood
            <input
              value={estateOrAreaOrNeighbourhood}
              onChange={(event) => setEstateOrAreaOrNeighbourhood(event.target.value)}
              placeholder="Kilimani"
            />
            {errors.estateOrAreaOrNeighbourhood ? <span>{errors.estateOrAreaOrNeighbourhood}</span> : null}
          </label>
          <label className="field-label">
            Street (if applicable)
            <input value={street} onChange={(event) => setStreet(event.target.value)} placeholder="Optional" />
          </label>
          <label className="field-label">
            Landmark (optional)
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
              if (suggested.road && !street) setStreet(suggested.road);
            }}
          />
          <label className="field-label">
            {PROPERTY_DESCRIPTION_LABEL}
            <textarea
              className="large-description-field"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={7}
              placeholder="Describe nearby roads, transport, schools, markets, business centres or landmarks that help people understand the location."
            />
            {errors.description ? <span>{errors.description}</span> : null}
          </label>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="auth-step" aria-labelledby="ownership-vacancy-title">
          <h2 id="ownership-vacancy-title">Ownership and vacancy</h2>
          <div className="responsibility-panel">
            <span className="badge">Registration responsibilities</span>
            <p>{getRegistrationResponsibilityCopy(profileRole)}</p>
          </div>

          <fieldset className="selection-fieldset">
            <legend>What is your relationship to this property?</legend>
            <label>
              <input
                type="radio"
                name="ownershipRole"
                checked={ownershipRole === 'owner'}
                onChange={() => setOwnershipRole('owner')}
              />
              I am the Owner
            </label>
            <label>
              <input
                type="radio"
                name="ownershipRole"
                checked={ownershipRole === 'property-manager'}
                onChange={() => setOwnershipRole('property-manager')}
              />
              I am the Property Manager
            </label>
            <label>
              <input
                type="radio"
                name="ownershipRole"
                checked={ownershipRole === 'leasing-agent'}
                onChange={() => setOwnershipRole('leasing-agent')}
              />
              I am the Leasing Agent
            </label>
            {errors.ownershipRole ? <p className="field-error">{errors.ownershipRole}</p> : null}
          </fieldset>

          <div className="link-foundation-grid">
            {profileRole !== 'property-owner' ? (
              <div className="link-foundation-card">
                <h3>Link the Property Owner</h3>
                <label className="field-label">
                  Owner name
                  <input value={ownerLinkName} onChange={(event) => setOwnerLinkName(event.target.value)} placeholder="Owner name, if known" />
                </label>
                <label className="field-label">
                  Owner phone
                  <input value={ownerLinkPhone} onChange={(event) => setOwnerLinkPhone(event.target.value)} placeholder="Owner phone, if known" />
                </label>
              </div>
            ) : null}

            {profileRole !== 'property-manager' ? (
              <div className="link-foundation-card">
                <h3>Assign or link a Property Manager</h3>
                <label className="field-label">
                  Manager name
                  <input value={managerLinkName} onChange={(event) => setManagerLinkName(event.target.value)} placeholder="Manager name, if applicable" />
                </label>
                <label className="field-label">
                  Manager phone
                  <input value={managerLinkPhone} onChange={(event) => setManagerLinkPhone(event.target.value)} placeholder="Manager phone, if applicable" />
                </label>
              </div>
            ) : null}

            {profileRole !== 'leasing-agent' ? (
              <div className="link-foundation-card">
                <h3>Assign or link a Leasing Agent</h3>
                <label className="field-label">
                  Leasing agent name
                  <input value={agentLinkName} onChange={(event) => setAgentLinkName(event.target.value)} placeholder="Agent name, if applicable" />
                </label>
                <label className="field-label">
                  Leasing agent phone
                  <input value={agentLinkPhone} onChange={(event) => setAgentLinkPhone(event.target.value)} placeholder="Agent phone, if applicable" />
                </label>
              </div>
            ) : null}
          </div>


          {category !== 'event-halls' ? (
            <>
          <fieldset className="selection-fieldset">
            <legend>Is electricity available?</legend>
            <label><input type="radio" name="genericElectricity" checked={isElectricityAvailable === 'yes'} onChange={() => setIsElectricityAvailable('yes')} /> Yes</label>
            <label><input type="radio" name="genericElectricity" checked={isElectricityAvailable === 'no'} onChange={() => setIsElectricityAvailable('no')} /> No</label>
            {errors.electricity ? <p className="field-error">{errors.electricity}</p> : null}
          </fieldset>
          {isElectricityAvailable === 'yes' ? (
            <div className="vacancy-foundation-panel">
              <fieldset className="selection-fieldset">
                <legend>How is electricity billed?</legend>
                <label><input type="radio" name="genericElectricityBilling" checked={electricityBillingType === 'individual-meter'} onChange={() => setElectricityBillingType('individual-meter')} /> Individual Meter</label>
                <label><input type="radio" name="genericElectricityBilling" checked={electricityBillingType === 'shared-meter'} onChange={() => setElectricityBillingType('shared-meter')} /> Shared Meter</label>
                <label><input type="radio" name="genericElectricityBilling" checked={electricityBillingType === 'included-in-rent'} onChange={() => setElectricityBillingType('included-in-rent')} /> Included in Rent</label>
                <label><input type="radio" name="genericElectricityBilling" checked={electricityBillingType === 'other'} onChange={() => setElectricityBillingType('other')} /> Other</label>
              </fieldset>
              {electricityBillingType === 'other' ? (
                <label className="field-label">Briefly describe the electricity billing arrangement
                  <input value={electricityOtherBilling} onChange={(event) => setElectricityOtherBilling(event.target.value)} />
                  {errors.electricityOtherBilling ? <span>{errors.electricityOtherBilling}</span> : null}
                </label>
              ) : null}
              <label className="field-label">Power availability notes, if necessary
                <textarea className="large-description-field" rows={3} value={powerAvailabilityNotes} onChange={(event) => setPowerAvailabilityNotes(event.target.value)} placeholder="Add any useful information about electricity supply." />
              </label>
            </div>
          ) : null}
            </>
          ) : null}

          <fieldset className="selection-fieldset">
            <legend>Does this property currently have vacant units?</legend>
            <label>
              <input type="radio" name="hasVacantUnits" checked={hasVacantUnits === 'yes'} onChange={() => setHasVacantUnits('yes')} />
              Yes
            </label>
            <label>
              <input type="radio" name="hasVacantUnits" checked={hasVacantUnits === 'no'} onChange={() => setHasVacantUnits('no')} />
              No
            </label>
            {errors.hasVacantUnits ? <p className="field-error">{errors.hasVacantUnits}</p> : null}
          </fieldset>

          {hasVacantUnits === 'yes' ? (
            <div className="vacancy-foundation-panel">
              <span className="badge">Vacancy verification ready</span>
              <label className="field-label">
                Vacancy information
                <textarea
                  className="large-description-field"
                  value={vacancySummary}
                  onChange={(event) => setVacancySummary(event.target.value)}
                  rows={4}
                  placeholder="Add basic vacancy details. Future prompts will collect detailed units for each property type."
                />
                {errors.vacancySummary ? <span>{errors.vacancySummary}</span> : null}
              </label>
              <label className="field-label">
                Number of vacant units, if known
                <input
                  value={unitsAvailable}
                  onChange={(event) => setUnitsAvailable(event.target.value)}
                  type="number"
                  min="1"
                  inputMode="numeric"
                />
                {errors.unitsAvailable ? <span>{errors.unitsAvailable}</span> : null}
              </label>
              <label className="field-label">
                Real-world vacant unit identifiers
                <textarea
                  className="large-description-field"
                  value={unitIdentifiers}
                  onChange={(event) => setUnitIdentifiers(event.target.value)}
                  rows={3}
                  placeholder="Enter each actual unit identifier exactly as it appears, for example A1, Shop 14, Unit 12 or Room 7."
                />
                {errors.unitIdentifiers ? <span>{errors.unitIdentifiers}</span> : null}
              </label>
            </div>
          ) : (
            <p className="auth-message">
              The property can be registered without publishing units. Vacancies can be added when they become available.
            </p>
          )}
        </section>
      ) : null}

      {step === 4 ? (
        <section className="auth-step" aria-labelledby="photos-review-title">
          <h2 id="photos-review-title">Photos and review</h2>
          <label className="field-label">
            Property Photos
            <input type="file" accept="image/*" multiple onChange={(event) => onPhotoSelection(event.target.files)} />
          </label>
          <p className="small-note">Use clear, relevant, high-quality photos. Future prompts will define photo rules for each property type.</p>
          {photoNames.length ? (
            <ul className="uploaded-photo-list">
              {photoNames.map((name) => <li key={name}>{name}</li>)}
            </ul>
          ) : null}
          <div className="review-summary-card">
            <h3>Registration summary</h3>
            <p>{PROPERTY_REGISTRATION_CATEGORIES.find((item) => item.id === category)?.label} in {estateOrAreaOrNeighbourhood || 'the selected area'}, {townOrCity || 'town/city'}, {county || 'county'}.</p>
            <p>Vacancy status: {hasVacantUnits === 'yes' ? 'Vacant units available' : 'No current vacancies'}</p>
          </div>
        </section>
      ) : null}

      <div className="auth-actions">
        {step > 1 ? <button type="button" className="secondary-action" onClick={() => setStep(step - 1)}>Back</button> : null}
        {step < 4 ? <button type="button" className="primary-action" onClick={() => setStep(step + 1)}>Continue</button> : null}
        <button type="button" className="secondary-action" onClick={() => save('save-draft')} disabled={savingAction !== null}>
          {savingAction === 'save-draft' ? 'Saving draft...' : 'Save as Draft'}
        </button>
        <button type="button" className="secondary-action" onClick={() => save('save-draft')} disabled={savingAction !== null}>
          Continue Later
        </button>
        {step === 4 ? (
          <button type="button" className="primary-action" onClick={() => save('submit-registration')} disabled={savingAction !== null}>
            {savingAction === 'submit-registration' ? 'Submitting...' : 'Submit Registration'}
          </button>
        ) : null}
      </div>

      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
    </section>
  );
}

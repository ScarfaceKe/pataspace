'use client';

import { PropertyLocationVerificationStep } from '@/components/properties/PropertyLocationVerificationStep';
import { ListingWhatsAppSupport } from '@/components/support/ListingWhatsAppSupport';
import type { PropertyLocationVerification } from '@/domain/location-verification';
import { useMemo, useState } from 'react';
import { KENYA_COUNTIES, KNOWN_KENYA_LOCATION_TERMS } from '@/domain/kenya-location-intelligence';
import { getRegistrationResponsibilityCopy, type PropertyOwnershipRole, type PropertyRegistrationAction } from '@/domain/property-registration';
import {
  MIXED_USE_BUILDING_FOUNDATION,
  MIXED_USE_UNIT_CATEGORIES,
  FLOOR_OPTIONS,
  createDefaultMixedUseUnit,
  getCategorySummary,
  getVacantUnitCount,
  type MixedUseUnitInput,
  type MixedUseUnitCategory,
  type MixedUseWhatsAppContact,
} from '@/domain/mixed-use-building-registration';
import { COMMERCIAL_UNIT_TYPES, SHOP_TYPES, type ShopTypeId, type CommercialUnitTypeId, type ShopPricingCategoryId } from '@/domain/shop-registration';
import { OFFICE_TYPES, type OfficeTypeId } from '@/domain/office-registration';
import { HALL_CATEGORIES, type HallCategoryId } from '@/domain/event-hall-registration';
import { RESIDENTIAL_CATEGORIES, type ResidentialCategoryId } from '@/domain/house-registration';
import type { UserRoleId } from '@/domain/types';
import { summarizeImageUploadResults, uploadPropertyImageFiles } from '@/components/properties/propertyImageUploadClient';

interface WhatsAppContactDraft {
  whatsappNumber: string;
  role: PropertyOwnershipRole;
  fullName: string;
}

const totalSteps = 6;

function toNumberOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function MixedUseBuildingRegistrationForm({ profileRole }: { profileRole: UserRoleId }) {
  const defaultOwnership: PropertyOwnershipRole =
    profileRole === 'property-owner' ? 'owner' : profileRole === 'leasing-agent' ? 'leasing-agent' : 'property-manager';

  const [step, setStep] = useState(1);
  const [understood, setUnderstood] = useState(false);
  const [locationVerification, setLocationVerification] = useState<PropertyLocationVerification | undefined>();
  const [buildingName, setBuildingName] = useState('');
  const [county, setCounty] = useState('');
  const [townOrCity, setTownOrCity] = useState('');
  const [estateOrArea, setEstateOrArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [entrancePhotoNames, setEntrancePhotoNames] = useState<string[]>([]);
  const [entrancePhotoFiles, setEntrancePhotoFiles] = useState<File[]>([]);
  const [buildingExteriorPhotoNames, setBuildingExteriorPhotoNames] = useState<string[]>([]);
  const [buildingExteriorPhotoFiles, setBuildingExteriorPhotoFiles] = useState<File[]>([]);
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContactDraft[]>([
    { whatsappNumber: '', role: 'property-manager', fullName: '' },
  ]);
  const [units, setUnits] = useState<MixedUseUnitInput[]>([createDefaultMixedUseUnit()]);
  const [description, setDescription] = useState('');
  const [ownershipRole, setOwnershipRole] = useState<PropertyOwnershipRole>(defaultOwnership);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingAction, setSavingAction] = useState<PropertyRegistrationAction | null>(null);
  const [editingUnitIndex, setEditingUnitIndex] = useState<number | null>(0);

  const categorySummary = useMemo(() => getCategorySummary(units), [units]);
  const vacantCount = useMemo(() => getVacantUnitCount(units), [units]);

  function selectEntrancePhotos(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    setEntrancePhotoFiles(files);
    setEntrancePhotoNames(files.map((f) => f.name));
  }

  function selectBuildingExteriorPhotos(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    setBuildingExteriorPhotoFiles(files);
    setBuildingExteriorPhotoNames(files.map((f) => f.name));
  }

  function updateWhatsAppContact(index: number, updates: Partial<WhatsAppContactDraft>) {
    setWhatsappContacts((c) => c.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  }

  function addWhatsAppContact() {
    setWhatsappContacts((c) => [...c, { whatsappNumber: '', role: 'leasing-agent', fullName: '' }]);
  }

  function removeWhatsAppContact(index: number) {
    setWhatsappContacts((c) => c.filter((_, i) => i !== index));
  }

  function updateUnit(index: number, updates: Partial<MixedUseUnitInput>) {
    setUnits((c) => c.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  }

  function addNewUnit() {
    const newUnit = createDefaultMixedUseUnit();
    setUnits((c) => [...c, newUnit]);
    setEditingUnitIndex(units.length);
  }

  function removeUnit(index: number) {
    setUnits((c) => c.filter((_, i) => i !== index));
    if (editingUnitIndex !== null && editingUnitIndex >= units.length - 1) {
      setEditingUnitIndex(Math.max(0, units.length - 2));
    }
  }

  async function save(action: PropertyRegistrationAction) {
    setSavingAction(action);
    setErrors({});
    setMessage(action === 'save-draft' ? 'Saving your building draft...' : 'Submitting mixed-use building...');

    const response = await fetch('/api/mixed-use-buildings/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buildingName,
        location: { county, townOrCity, estateOrAreaOrNeighbourhood: estateOrArea, landmark, verification: locationVerification },
        description,
        ownershipRole,
        entrancePhotos: entrancePhotoNames.map((fileName) => ({ fileName })),
        buildingPhotos: buildingExteriorPhotoNames.map((fileName) => ({ fileName })),
        whatsappContacts: whatsappContacts.filter((c) => c.whatsappNumber.trim()),
        units: units.map((u) => ({
          ...u,
          unitIdentifiers: u.unitIdentifiers ?? [],
        })),
        action,
      }),
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
    if (result.building?.propertyFoundationId && allPhotoFiles.length) {
      const uploadResults = await uploadPropertyImageFiles({ propertyId: result.building.propertyFoundationId, files: allPhotoFiles, onProgress: setMessage });
      imageUploadSummary = summarizeImageUploadResults(uploadResults);
    }

    setMessage(`${result.message}${imageUploadSummary ? ` ${imageUploadSummary}` : ''}`);
  }

  const currentUnit = editingUnitIndex !== null ? units[editingUnitIndex] : null;

  return (
    <section className="property-registration-card" aria-labelledby="mixed-use-title">
      <div className="auth-header">
        <span className="section-eyebrow">Mixed-use building registration</span>
        <h1 id="mixed-use-title">Register a mixed-use building</h1>
        <p>{getRegistrationResponsibilityCopy(profileRole)} This guided workflow collects information for one building with multiple property categories.</p>
      </div>

      <ListingWhatsAppSupport context="listing" />

      <div className="progress-steps" aria-label="Registration progress">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" className={step === n ? 'step active' : 'step'} onClick={() => setStep(n)} aria-current={step === n ? 'step' : undefined}>{n}</button>
        ))}
      </div>

      {/* Step 1: Understanding */}
      {step === 1 && (
        <section className="auth-step">
          <h2>What is a Mixed-Use Building?</h2>
          <div className="vacancy-foundation-panel" style={{ marginBottom: '1rem', lineHeight: 1.7 }}>
            <p style={{ marginBottom: '1rem' }}>{MIXED_USE_BUILDING_FOUNDATION.understandingCopy}</p>
            <p style={{ marginBottom: '1rem' }}><strong>Key points:</strong></p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>One building = one listing. All units share the same location, entrance, and building photos.</li>
              <li>Each unit has its own category (shop, office, hall, or house), its own pricing, and its own vacancy status.</li>
              <li>Units can be on any floor — a single floor can have mixed categories.</li>
              <li>Customers searching for shops will see your shop units; customers searching for offices will see your office units.</li>
              <li>Each unit unlocks independently — a shop seeker only pays to unlock a specific shop unit.</li>
              <li>One admin approval covers the entire building.</li>
            </ul>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} style={{ width: 'auto' }} />
              <strong>I understand what a Mixed-Use Building is and want to register one.</strong>
            </label>
          </div>
          {!understood ? <p className="field-error">Please confirm you understand before continuing.</p> : null}
        </section>
      )}

      {/* Step 2: Building name + location */}
      {step === 2 && (
        <section className="auth-step">
          <h2>Building Information</h2>
          <label className="field-label">Building Name *
            <input value={buildingName} onChange={(e) => setBuildingName(e.target.value)} placeholder="e.g. Nairobi Heights, Westgate Complex" />
            {errors.buildingName ? <span>{errors.buildingName}</span> : null}
          </label>
          <label className="field-label">County *
            <input list="kenya-counties" value={county} onChange={(e) => setCounty(e.target.value)} placeholder="Nairobi" />
            {errors.county ? <span>{errors.county}</span> : null}
          </label>
          <label className="field-label">Town / City *
            <input list="known-kenya-locations" value={townOrCity} onChange={(e) => setTownOrCity(e.target.value)} placeholder="Nairobi" />
            {errors.townOrCity ? <span>{errors.townOrCity}</span> : null}
          </label>
          <label className="field-label">Estate / Area *
            <input list="known-kenya-locations" value={estateOrArea} onChange={(e) => setEstateOrArea(e.target.value)} placeholder="Westlands" />
            {errors.estateOrArea ? <span>{errors.estateOrArea}</span> : null}
          </label>
          <label className="field-label">Landmark (optional)
            <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near a known landmark" />
          </label>
          <ListingWhatsAppSupport context="location" />
          <PropertyLocationVerificationStep value={locationVerification} onChange={setLocationVerification} onSuggestedAddress={(s) => { if (s.county && !county) setCounty(s.county); if (s.town && !townOrCity) setTownOrCity(s.town); if (s.estate && !estateOrArea) setEstateOrArea(s.estate); if (s.road && !landmark) setLandmark(s.road); }} />
          <datalist id="kenya-counties">{KENYA_COUNTIES.map((c) => <option key={c} value={c} />)}</datalist>
          <datalist id="known-kenya-locations">{KNOWN_KENYA_LOCATION_TERMS.map((l) => <option key={l} value={l} />)}</datalist>
        </section>
      )}

      {/* Step 3: Building photos */}
      {step === 3 && (
        <section className="auth-step">
          <h2>Building Photos</h2>
          <div className="vacancy-foundation-panel" style={{ marginBottom: '1rem' }}>
            <span className="badge">Required: Entrance Photo</span>
            <p className="small-note" style={{ marginTop: '0.5rem' }}>Upload a clear photo of the main building entrance.</p>
            <label className="field-label">Entrance photo
              <input type="file" accept="image/*" multiple onChange={(e) => selectEntrancePhotos(e.target.files)} />
            </label>
            {entrancePhotoNames.length ? <ul className="uploaded-photo-list">{entrancePhotoNames.map((n) => <li key={n}>{n}</li>)}</ul> : null}
          </div>
          <div className="vacancy-foundation-panel" style={{ marginBottom: '1rem' }}>
            <span className="badge">Required: Whole Building Photo</span>
            <p className="small-note" style={{ marginTop: '0.5rem' }}>Upload a photo showing the entire building exterior.</p>
            <label className="field-label">Whole building photo
              <input type="file" accept="image/*" multiple onChange={(e) => selectBuildingExteriorPhotos(e.target.files)} />
            </label>
            {buildingExteriorPhotoNames.length ? <ul className="uploaded-photo-list">{buildingExteriorPhotoNames.map((n) => <li key={n}>{n}</li>)}</ul> : null}
          </div>
          <label className="field-label">Building Description *
            <textarea className="large-description-field" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the building, its surroundings, parking, security, and what types of spaces it offers." />
            {errors.description ? <span>{errors.description}</span> : null}
          </label>
          <fieldset className="selection-fieldset">
            <legend>Registration relationship</legend>
            <label><input type="radio" name="ownershipRole" checked={ownershipRole === 'owner'} onChange={() => setOwnershipRole('owner')} /> I am the Owner</label>
            <label><input type="radio" name="ownershipRole" checked={ownershipRole === 'property-manager'} onChange={() => setOwnershipRole('property-manager')} /> I am the Property Manager</label>
            <label><input type="radio" name="ownershipRole" checked={ownershipRole === 'leasing-agent'} onChange={() => setOwnershipRole('leasing-agent')} /> I am the Leasing Agent</label>
          </fieldset>
        </section>
      )}

      {/* Step 4: WhatsApp contacts */}
      {step === 4 && (
        <section className="auth-step">
          <h2>WhatsApp Contacts</h2>
          <p className="small-note">Provide WhatsApp numbers for key contacts. The property manager&apos;s number receives most notifications.</p>
          {whatsappContacts.map((contact, index) => (
            <div className="house-vacancy-card" key={`whatsapp-${index}`} style={{ marginBottom: '1rem' }}>
              <fieldset className="selection-fieldset">
                <legend>Contact Role</legend>
                <label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'property-manager'} onChange={() => updateWhatsAppContact(index, { role: 'property-manager' })} /> Property Manager</label>
                <label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'owner'} onChange={() => updateWhatsAppContact(index, { role: 'owner' })} /> Owner</label>
                <label><input type="radio" name={`whatsappRole-${index}`} checked={contact.role === 'leasing-agent'} onChange={() => updateWhatsAppContact(index, { role: 'leasing-agent' })} /> Leasing Agent</label>
              </fieldset>
              <label className="field-label">Full Name
                <input value={contact.fullName} onChange={(e) => updateWhatsAppContact(index, { fullName: e.target.value })} placeholder="Contact full name" />
              </label>
              <label className="field-label">WhatsApp Number
                <input value={contact.whatsappNumber} onChange={(e) => updateWhatsAppContact(index, { whatsappNumber: e.target.value })} placeholder="For example +254 712 345 678" />
              </label>
              {whatsappContacts.length > 1 ? <button type="button" className="secondary-action" onClick={() => removeWhatsAppContact(index)}>Remove</button> : null}
            </div>
          ))}
          {whatsappContacts.length < 3 ? <button type="button" className="secondary-action" onClick={addWhatsAppContact}>Add Another Contact</button> : null}
          <p className="small-note" style={{ marginTop: '1rem' }}>You can add up to 3 contacts. The Property Manager&apos;s WhatsApp number receives listing notifications and customer activity alerts for all units.</p>
        </section>
      )}

      {/* Step 5: Add units */}
      {step === 5 && (
        <section className="auth-step">
          <h2>Add Your Units</h2>
          <p className="small-note" style={{ marginBottom: '1rem' }}>
            Add each unit in your building. Each unit has its own category, floor location, pricing, and vacancy status.
          </p>

          {/* Summary bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {MIXED_USE_UNIT_CATEGORIES.map((cat) => (
              <span key={cat.id} className="badge" style={{ fontSize: '0.8rem' }}>
                {cat.icon} {categorySummary[cat.id]} {cat.label}
              </span>
            ))}
            <span className="badge" style={{ fontSize: '0.8rem', background: 'var(--info-bg, #eff6ff)', color: 'var(--info-text, #1e40af)' }}>
              {vacantCount} vacant
            </span>
          </div>

          {/* Unit list */}
          {units.map((unit, index) => (
            <div
              key={unit.id}
              className="house-vacancy-card"
              style={{
                marginBottom: '0.75rem',
                padding: '0.75rem',
                border: editingUnitIndex === index ? '2px solid var(--primary, #10b981)' : '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
              onClick={() => setEditingUnitIndex(index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{unit.unitIdentifier || `Unit ${index + 1}`}</strong>
                  <span className="small-note" style={{ marginLeft: '0.5rem', opacity: 0.6 }}>
                    {MIXED_USE_UNIT_CATEGORIES.find((c) => c.id === unit.category)?.icon} {unit.floor} floor · {MIXED_USE_UNIT_CATEGORIES.find((c) => c.id === unit.category)?.label}
                    {unit.isVacant ? ' · Vacant' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {units.length > 1 ? (
                    <button type="button" className="secondary-action" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); removeUnit(index); }}>
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          {/* Unit editor */}
          {currentUnit && (
            <div className="vacancy-foundation-panel" style={{ marginTop: '1rem' }}>
              <span className="badge">Editing Unit {editingUnitIndex !== null ? editingUnitIndex + 1 : ''}</span>

              <label className="field-label" style={{ marginTop: '0.75rem' }}>Unit Identifier *
                <input value={currentUnit.unitIdentifier} onChange={(e) => updateUnit(editingUnitIndex!, { unitIdentifier: e.target.value })} placeholder="e.g. Shop 1, Office 203, Room A1, Hall B" />
                <span className="small-note">Every unit needs a unique name or code.</span>
                {errors[`unit-${editingUnitIndex}-identifier`] ? <span style={{ color: 'red' }}>{errors[`unit-${editingUnitIndex}-identifier`]}</span> : null}
              </label>

              <label className="field-label">Floor
                <select value={currentUnit.floor} onChange={(e) => updateUnit(editingUnitIndex!, { floor: e.target.value })}>
                  {FLOOR_OPTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </label>

              <label className="field-label">Category *
                <select value={currentUnit.category} onChange={(e) => updateUnit(editingUnitIndex!, { category: e.target.value as MixedUseUnitCategory })}>
                  {MIXED_USE_UNIT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </label>

              {/* Category-specific fields */}
              {currentUnit.category === 'shops' && (
                <>
                  <label className="field-label">Commercial Unit Type *
                    <select value={currentUnit.commercialUnitType ?? ''} onChange={(e) => updateUnit(editingUnitIndex!, { commercialUnitType: e.target.value as CommercialUnitTypeId })}>
                      <option value="">Select...</option>
                      {COMMERCIAL_UNIT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </label>
                  <label className="field-label">Shop Type (what business suits this unit)
                    <select value={currentUnit.shopTypes?.[0] ?? ''} onChange={(e) => updateUnit(editingUnitIndex!, { shopTypes: e.target.value ? [e.target.value as ShopTypeId] : [] })}>
                      <option value="">Select...</option>
                      {SHOP_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </label>
                </>
              )}

              {currentUnit.category === 'offices' && (
                <label className="field-label">Office Type *
                  <select value={currentUnit.officeType ?? ''} onChange={(e) => updateUnit(editingUnitIndex!, { officeType: e.target.value as OfficeTypeId })}>
                    <option value="">Select...</option>
                    {OFFICE_TYPES.filter((t) => t.id !== 'mixed-office-type').map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </label>
              )}

              {currentUnit.category === 'event-halls' && (
                <label className="field-label">Hall Category *
                  <select value={currentUnit.hallCategory ?? ''} onChange={(e) => updateUnit(editingUnitIndex!, { hallCategory: e.target.value as HallCategoryId })}>
                    <option value="">Select...</option>
                    {HALL_CATEGORIES.filter((c) => c.id !== 'mixed-hall-category').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </label>
              )}

              {currentUnit.category === 'houses' && (
                <label className="field-label">Residential Category *
                  <select value={currentUnit.residentialCategory ?? ''} onChange={(e) => updateUnit(editingUnitIndex!, { residentialCategory: e.target.value as ResidentialCategoryId })}>
                    <option value="">Select...</option>
                    {RESIDENTIAL_CATEGORIES.filter((c) => c.id !== 'mixed-residential-property').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </label>
              )}

              {/* Shared: Rent & Deposit */}
              <label className="field-label">Monthly Rent (KES)
                <input type="number" min="0" value={currentUnit.rent.monthlyRent ?? ''} onChange={(e) => updateUnit(editingUnitIndex!, { rent: { ...currentUnit.rent, monthlyRent: toNumberOrNull(e.target.value) } })} placeholder="Rent in KES" />
              </label>
              <label className="field-label">Deposit Amount (KES)
                <input type="number" min="0" value={currentUnit.rent.depositAmount ?? ''} onChange={(e) => updateUnit(editingUnitIndex!, { rent: { ...currentUnit.rent, depositAmount: toNumberOrNull(e.target.value) } })} placeholder="Deposit in KES" />
              </label>

              {/* Vacancy */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={currentUnit.isVacant} onChange={(e) => updateUnit(editingUnitIndex!, { isVacant: e.target.checked })} style={{ width: 'auto' }} />
                <strong>This unit is currently vacant</strong>
              </label>

              {currentUnit.isVacant && (
                <>
                  <label className="field-label" style={{ marginTop: '0.5rem' }}>Quantity Available
                    <input type="number" min="1" value={currentUnit.quantityAvailable ?? ''} onChange={(e) => updateUnit(editingUnitIndex!, { quantityAvailable: toNumberOrNull(e.target.value) })} placeholder="1" />
                  </label>
                  <label className="field-label">Vacant unit identifiers (one per line)
                    <textarea className="large-description-field" rows={2} value={(currentUnit.unitIdentifiers ?? []).join('\n')} onChange={(e) => updateUnit(editingUnitIndex!, { unitIdentifiers: e.target.value.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean) })} placeholder="Enter unit IDs if multiple of this type are vacant" />
                  </label>
                </>
              )}
            </div>
          )}

          <button type="button" className="primary-action" style={{ marginTop: '1rem' }} onClick={addNewUnit}>
            + Add Another Unit
          </button>

          {errors.units ? <p className="field-error" style={{ marginTop: '0.5rem' }}>{errors.units}</p> : null}
          <p className="small-note" style={{ marginTop: '0.5rem' }}>You have {units.length} unit{units.length !== 1 ? 's' : ''} registered ({vacantCount} vacant).</p>
        </section>
      )}

      {/* Step 6: Review */}
      {step === 6 && (
        <section className="auth-step">
          <h2>Review & Submit</h2>
          <div className="vacancy-foundation-panel" style={{ marginBottom: '1rem' }}>
            <h3>{buildingName}</h3>
            <p className="small-note">{county}, {townOrCity}, {estateOrArea}{landmark ? ` · Near ${landmark}` : ''}</p>
            <p className="small-note">{description}</p>
          </div>

          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Units ({units.length})</h3>
          {MIXED_USE_UNIT_CATEGORIES.map((cat) => {
            const catUnits = units.filter((u) => u.category === cat.id);
            if (!catUnits.length) return null;
            return (
              <div key={cat.id} style={{ marginBottom: '1rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{cat.icon} {cat.label} ({catUnits.length})</p>
                {catUnits.map((u) => (
                  <div key={u.id} className="house-vacancy-card" style={{ padding: '0.5rem', marginBottom: '0.25rem' }}>
                    <p><strong>{u.unitIdentifier}</strong> · Floor: {u.floor} · {u.isVacant ? '🟢 Vacant' : '🔴 Occupied'}{u.rent.monthlyRent ? ` · KES ${u.rent.monthlyRent.toLocaleString()}/mo` : ''}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </section>
      )}

      {/* Actions */}
      <div className="auth-actions">
        {step > 1 ? <button type="button" className="secondary-action" onClick={() => setStep(step - 1)}>Back</button> : null}
        {step < totalSteps ? <button type="button" className="primary-action" onClick={() => {
          if (step === 1 && !understood) return;
          setStep(step + 1);
        }}>Continue</button> : null}
        <button type="button" className="secondary-action" onClick={() => save('save-draft')} disabled={savingAction !== null}>
          {savingAction === 'save-draft' ? 'Saving draft...' : 'Save as Draft'}
        </button>
        {step === totalSteps ? (
          <button type="button" className="primary-action" onClick={() => save('submit-registration')} disabled={savingAction !== null}>
            {savingAction === 'submit-registration' ? 'Submitting...' : 'Submit Registration'}
          </button>
        ) : null}
      </div>

      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
    </section>
  );
}

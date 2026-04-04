'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

type InstitutionType = 'school' | 'college' | 'coaching' | 'training_institute' | 'university';

const TYPE_OPTIONS: { value: InstitutionType; label: string }[] = [
  { value: 'school', label: 'School' },
  { value: 'university', label: 'University' },
  { value: 'college', label: 'College' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'training_institute', label: 'Training Institute' },
];

function emptyForm() {
  return {
    institutionName: '',
    institutionType: 'school' as InstitutionType,
    yearEstablished: '',
    affiliationBoard: '',
    studentStrength: '',
    logoUrl: '',
    chairmanName: '',
    principalName: '',
    adminName: '',
    adminEmail: '',
    adminMobile: '',
    officialEmail: '',
    contactMobile1: '',
    contactMobile2: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    mandal: '',
    district: '',
    state: '',
    pinCode: '',
    googleMapLocation: '',
  };
}

function buildPayload(form: ReturnType<typeof emptyForm>) {
  const year = Number(form.yearEstablished);
  const strength = Number(form.studentStrength);
  return {
    institutionName: form.institutionName.trim(),
    institutionType: form.institutionType,
    yearEstablished: Number.isFinite(year) ? year : NaN,
    affiliationBoard: form.affiliationBoard.trim(),
    studentStrength: Number.isFinite(strength) ? strength : NaN,
    logoUrl: form.logoUrl.trim(),
    chairmanName: form.chairmanName.trim(),
    principalName: form.principalName.trim(),
    adminName: form.adminName.trim(),
    adminEmail: form.adminEmail.trim().toLowerCase(),
    adminMobile: form.adminMobile.trim(),
    officialEmail: form.officialEmail.trim().toLowerCase(),
    contactMobile1: form.contactMobile1.trim(),
    contactMobile2: form.contactMobile2.trim(),
    addressLine1: form.addressLine1.trim(),
    addressLine2: form.addressLine2.trim(),
    city: form.city.trim(),
    mandal: form.mandal.trim(),
    district: form.district.trim(),
    state: form.state.trim(),
    pinCode: form.pinCode.trim(),
    googleMapLocation: form.googleMapLocation.trim(),
  };
}

function validateInstitutionPayload(p: ReturnType<typeof buildPayload>): string | null {
  if (!p.institutionName || p.institutionName.length < 2) return 'Institution name is required (min 2 characters).';
  if (!Number.isFinite(p.yearEstablished) || p.yearEstablished < 1800 || p.yearEstablished > 2100) {
    return 'Year established is required (1800–2100).';
  }
  if (!p.affiliationBoard) return 'Affiliation / board is required.';
  if (!Number.isFinite(p.studentStrength) || p.studentStrength < 0) return 'Student strength is required (0 or more).';
  if (!p.logoUrl || !/^https?:\/\//i.test(p.logoUrl)) return 'Logo is required (upload an image or paste a valid http(s) URL).';
  if (!p.chairmanName) return 'Chairman name is required.';
  if (!p.principalName) return 'Principal / head name is required.';
  if (!p.adminName) return 'Admin name is required.';
  if (!p.adminEmail || !/^\S+@\S+\.\S+$/.test(p.adminEmail)) return 'Valid admin email is required.';
  if (!p.adminMobile) return 'Admin mobile is required.';
  if (!p.officialEmail || !/^\S+@\S+\.\S+$/.test(p.officialEmail)) return 'Valid official email is required.';
  if (!p.contactMobile1) return 'Contact mobile 1 is required.';
  if (!p.contactMobile2) return 'Contact mobile 2 is required.';
  if (!p.addressLine1) return 'Address line 1 is required.';
  if (!p.addressLine2) return 'Address line 2 is required.';
  if (!p.city) return 'City is required.';
  if (!p.mandal) return 'Mandal is required.';
  if (!p.district) return 'District is required.';
  if (!p.state) return 'State is required.';
  if (!p.pinCode) return 'PIN code is required.';
  if (!p.googleMapLocation) return 'Google Maps link is required.';
  return null;
}

const VALID_TYPES: InstitutionType[] = ['school', 'university', 'college', 'coaching', 'training_institute'];

function fillFormFromApi(row: any) {
  const t = row.institutionType as string;
  const institutionType: InstitutionType = VALID_TYPES.includes(t as InstitutionType) ? (t as InstitutionType) : 'school';
  return {
    institutionName: row.institutionName || '',
    institutionType,
    yearEstablished: row.yearEstablished != null ? String(row.yearEstablished) : '',
    affiliationBoard: row.affiliationBoard || '',
    studentStrength: row.studentStrength != null ? String(row.studentStrength) : '',
    logoUrl: row.logoUrl || '',
    chairmanName: row.chairmanName || '',
    principalName: row.principalName || '',
    adminName: row.adminName || '',
    adminEmail: row.adminEmail || '',
    adminMobile: row.adminMobile || '',
    officialEmail: row.officialEmail || '',
    contactMobile1: row.contactMobile1 || '',
    contactMobile2: row.contactMobile2 || '',
    addressLine1: row.addressLine1 || '',
    addressLine2: row.addressLine2 || '',
    city: row.city || '',
    mandal: row.mandal || '',
    district: row.district || '',
    state: row.state || '',
    pinCode: row.pinCode || '',
    googleMapLocation: row.googleMapLocation || '',
  };
}

export default function AdminInstitutionNewPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const institutionId = searchParams.get('id');

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFileLabel, setLogoFileLabel] = useState('');
  const [error, setError] = useState('');

  const set = (key: keyof ReturnType<typeof emptyForm>, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }
    if (institutionId) {
      (async () => {
        try {
          setLoading(true);
          const res = await apiService.getInstitutionById(institutionId);
          if (res.success && res.data) {
            setForm(fillFormFromApi(res.data));
          } else {
            throw new Error('Failed to load institution');
          }
        } catch (e: any) {
          setError(e.message || 'Failed to load institution');
          toast.error(e.message || 'Failed to load institution');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isAuthenticated, user, router, institutionId]);

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLogoFileLabel(file.name);
    try {
      setUploadingLogo(true);
      const res = await apiService.uploadImage(file, 'career-master/institution-logos');
      if (res.success && (res.data as any)?.url) {
        set('logoUrl', (res.data as any).url);
        toast.success('Logo uploaded');
      } else {
        throw new Error('Upload did not return a URL');
      }
    } catch (err: any) {
      setLogoFileLabel('');
      toast.error(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError('');
    const payload = buildPayload(form);
    const validationError = validateInstitutionPayload(payload);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      const res = institutionId
        ? await apiService.updateInstitution(institutionId, payload)
        : await apiService.createInstitution(payload);
      if (res.success) {
        toast.success(institutionId ? 'Institution updated' : 'Institution created');
        router.push('/admin/institutions');
      } else {
        throw new Error(res.error?.message || 'Save failed');
      }
    } catch (e: any) {
      setError(e.message || 'Save failed');
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500';

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-lg text-gray-600">Loading institution…</div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {institutionId ? 'Edit institution' : 'Add institution'}
          </h1>
          <p className="text-sm text-gray-600">Basic profile, leadership, contacts, and address.</p>
        </div>
        <Link
          href="/admin/institutions"
          className="text-sm font-medium text-red-600 hover:text-red-800"
        >
          ← Back to list
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">A) Institution basic info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Institution name <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                value={form.institutionName}
                onChange={(e) => set('institutionName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Institution type <span className="text-red-500">*</span>
              </label>
              <select
                className={inputCls}
                value={form.institutionType}
                onChange={(e) => set('institutionType', e.target.value as InstitutionType)}
                required
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Year established <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={inputCls}
                min={1800}
                max={2100}
                value={form.yearEstablished}
                onChange={(e) => set('yearEstablished', e.target.value)}
                placeholder="e.g. 1995"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Affiliation / board <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                value={form.affiliationBoard}
                onChange={(e) => set('affiliationBoard', e.target.value)}
                placeholder="CBSE, ICSE, State Board…"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Student strength <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.studentStrength}
                onChange={(e) => set('studentStrength', e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Upload logo <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.logoUrl}
                    alt="Logo preview"
                    className="h-20 w-20 shrink-0 rounded-lg border border-gray-200 object-contain"
                  />
                ) : null}
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                  <label
                    htmlFor="inst-logo-input"
                    className="inline-flex shrink-0 cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                  >
                    Browse
                  </label>
                  <input
                    id="inst-logo-input"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploadingLogo}
                    onChange={handleLogoFile}
                  />
                  <span className="min-w-0 truncate text-sm text-gray-600" title={logoFileLabel || undefined}>
                    {uploadingLogo ? 'Uploading…' : logoFileLabel || 'No file selected'}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Or paste image URL:</p>
              <input
                className={`${inputCls} mt-1`}
                value={form.logoUrl}
                onChange={(e) => set('logoUrl', e.target.value)}
                placeholder="https://…"
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">B) Leadership</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Chairman name <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                value={form.chairmanName}
                onChange={(e) => set('chairmanName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Principal / head name <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                value={form.principalName}
                onChange={(e) => set('principalName', e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">C) Admin details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Admin name <span className="text-red-500">*</span>
              </label>
              <input className={inputCls} value={form.adminName} onChange={(e) => set('adminName', e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Admin email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={inputCls}
                value={form.adminEmail}
                onChange={(e) => set('adminEmail', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Admin mobile <span className="text-red-500">*</span>
              </label>
              <input className={inputCls} value={form.adminMobile} onChange={(e) => set('adminMobile', e.target.value)} required />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">D) Contact details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Official email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={inputCls}
                value={form.officialEmail}
                onChange={(e) => set('officialEmail', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Contact mobile 1 <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                value={form.contactMobile1}
                onChange={(e) => set('contactMobile1', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Contact mobile 2 <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                value={form.contactMobile2}
                onChange={(e) => set('contactMobile2', e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">E) Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Address line 1 <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                value={form.addressLine1}
                onChange={(e) => set('addressLine1', e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Address line 2 <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                value={form.addressLine2}
                onChange={(e) => set('addressLine2', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Village / city <span className="text-red-500">*</span>
              </label>
              <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Mandal <span className="text-red-500">*</span>
              </label>
              <input className={inputCls} value={form.mandal} onChange={(e) => set('mandal', e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                District <span className="text-red-500">*</span>
              </label>
              <input className={inputCls} value={form.district} onChange={(e) => set('district', e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                State <span className="text-red-500">*</span>
              </label>
              <input className={inputCls} value={form.state} onChange={(e) => set('state', e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                PIN code <span className="text-red-500">*</span>
              </label>
              <input className={inputCls} value={form.pinCode} onChange={(e) => set('pinCode', e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Google Maps link <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                value={form.googleMapLocation}
                onChange={(e) => set('googleMapLocation', e.target.value)}
                placeholder="https://maps.google.com/…"
                required
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : institutionId ? 'Update institution' : 'Create institution'}
          </button>
          <Link
            href="/admin/institutions"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

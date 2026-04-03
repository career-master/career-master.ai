'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

type InstitutionType = 'school' | 'college' | 'coaching' | 'training_institute';

const TYPE_OPTIONS: { value: InstitutionType; label: string }[] = [
  { value: 'school', label: 'School' },
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
  const p: Record<string, unknown> = {
    institutionName: form.institutionName.trim(),
    institutionType: form.institutionType,
  };
  const s = (v: string) => {
    const t = v.trim();
    return t === '' ? undefined : t;
  };
  const n = (v: string) => {
    if (v.trim() === '') return undefined;
    const x = Number(v);
    return Number.isFinite(x) ? x : undefined;
  };

  p.yearEstablished = n(form.yearEstablished);
  p.affiliationBoard = s(form.affiliationBoard);
  p.studentStrength = n(form.studentStrength);
  p.logoUrl = s(form.logoUrl);
  p.chairmanName = s(form.chairmanName);
  p.principalName = s(form.principalName);
  p.adminName = s(form.adminName);
  p.adminEmail = s(form.adminEmail);
  p.adminMobile = s(form.adminMobile);
  p.officialEmail = s(form.officialEmail);
  p.contactMobile1 = s(form.contactMobile1);
  p.contactMobile2 = s(form.contactMobile2);
  p.addressLine1 = s(form.addressLine1);
  p.addressLine2 = s(form.addressLine2);
  p.city = s(form.city);
  p.mandal = s(form.mandal);
  p.district = s(form.district);
  p.state = s(form.state);
  p.pinCode = s(form.pinCode);
  p.googleMapLocation = s(form.googleMapLocation);

  return JSON.parse(JSON.stringify(p));
}

function fillFormFromApi(row: any) {
  return {
    institutionName: row.institutionName || '',
    institutionType: (row.institutionType || 'school') as InstitutionType,
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
      toast.error(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError('');
    if (!form.institutionName.trim()) {
      setError('Institution name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(form);
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
              <label className="text-sm font-medium text-gray-700">Institution name *</label>
              <input
                className={inputCls}
                value={form.institutionName}
                onChange={(e) => set('institutionName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Institution type</label>
              <select
                className={inputCls}
                value={form.institutionType}
                onChange={(e) => set('institutionType', e.target.value as InstitutionType)}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Year established</label>
              <input
                type="number"
                className={inputCls}
                min={1800}
                max={2100}
                value={form.yearEstablished}
                onChange={(e) => set('yearEstablished', e.target.value)}
                placeholder="e.g. 1995"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Affiliation / board</label>
              <input
                className={inputCls}
                value={form.affiliationBoard}
                onChange={(e) => set('affiliationBoard', e.target.value)}
                placeholder="CBSE, ICSE, State Board, University…"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Student strength</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.studentStrength}
                onChange={(e) => set('studentStrength', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Logo</label>
              <div className="mt-2 flex flex-wrap items-end gap-4">
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.logoUrl}
                    alt="Logo preview"
                    className="h-20 w-20 rounded-lg border border-gray-200 object-contain"
                  />
                ) : null}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className="text-sm text-gray-700"
                    disabled={uploadingLogo}
                    onChange={handleLogoFile}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {uploadingLogo ? 'Uploading…' : 'Or paste a URL below.'}
                  </p>
                </div>
              </div>
              <input
                className={`${inputCls} mt-2`}
                value={form.logoUrl}
                onChange={(e) => set('logoUrl', e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">B) Leadership</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Chairman name</label>
              <input className={inputCls} value={form.chairmanName} onChange={(e) => set('chairmanName', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Principal / head name</label>
              <input className={inputCls} value={form.principalName} onChange={(e) => set('principalName', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">C) Admin details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Admin name</label>
              <input className={inputCls} value={form.adminName} onChange={(e) => set('adminName', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Admin email</label>
              <input
                type="email"
                className={inputCls}
                value={form.adminEmail}
                onChange={(e) => set('adminEmail', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Admin mobile</label>
              <input className={inputCls} value={form.adminMobile} onChange={(e) => set('adminMobile', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">D) Contact details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Official email</label>
              <input
                type="email"
                className={inputCls}
                value={form.officialEmail}
                onChange={(e) => set('officialEmail', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Contact mobile 1</label>
              <input className={inputCls} value={form.contactMobile1} onChange={(e) => set('contactMobile1', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Contact mobile 2</label>
              <input className={inputCls} value={form.contactMobile2} onChange={(e) => set('contactMobile2', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">E) Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Address line 1</label>
              <input className={inputCls} value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Address line 2</label>
              <input className={inputCls} value={form.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Village / city</label>
              <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mandal</label>
              <input className={inputCls} value={form.mandal} onChange={(e) => set('mandal', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">District</label>
              <input className={inputCls} value={form.district} onChange={(e) => set('district', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">State</label>
              <input className={inputCls} value={form.state} onChange={(e) => set('state', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">PIN code</label>
              <input className={inputCls} value={form.pinCode} onChange={(e) => set('pinCode', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Google Maps link</label>
              <input
                className={inputCls}
                value={form.googleMapLocation}
                onChange={(e) => set('googleMapLocation', e.target.value)}
                placeholder="https://maps.google.com/…"
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

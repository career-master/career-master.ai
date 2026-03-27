'use client';

import { useState } from 'react';

export default function DashboardCouponsPage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setMessage('Please enter a coupon code.');
      return;
    }
    setMessage('Coupon feature is being enabled for user dashboard. Please contact support for manual coupon assistance.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply Coupon</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter your coupon code below.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coupon Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
            >
              Apply Coupon
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { toast } from 'react-hot-toast';

type Props = {
  onPdf: () => void | Promise<void>;
  onDoc: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
};

/**
 * Paired PDF / DOC export triggers for admin list screens.
 */
export default function AdminExportButtons({ onPdf, onDoc, disabled, className }: Props) {
  const run = async (fn: () => void | Promise<void>, label: string) => {
    if (disabled) return;
    try {
      toast.loading(`${label}…`, { id: 'admin-export' });
      await fn();
      toast.success('Download started', { id: 'admin-export' });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Export failed';
      toast.error(msg, { id: 'admin-export' });
    }
  };

  const btn =
    'inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className={`inline-flex overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm ${className ?? ''}`}>
      <button
        type="button"
        disabled={disabled}
        className={`${btn} border-r border-gray-300 text-red-700 hover:bg-red-50`}
        onClick={() => void run(onPdf, 'Preparing PDF')}
      >
        PDF
      </button>
      <button
        type="button"
        disabled={disabled}
        className={`${btn} text-gray-800 hover:bg-gray-50`}
        onClick={() => void run(onDoc, 'Preparing DOC')}
      >
        DOC
      </button>
    </div>
  );
}

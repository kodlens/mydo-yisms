import { CheckCircle2, CircleAlert, Clock, MapPin, QrCode, User, X } from 'lucide-react';
import { useEffect } from 'react';

export type ConfirmationData = {
  id: number;
  full_name: string;
  reference_code?: string;
  student_id?: string;
  email?: string;
  barangay?: string;
  method: string;
  attended_at: string;
};

type Props = {
  data: ConfirmationData | null;
  error: string | null;
  onClear: () => void;
};

export default function AttendanceConfirmationCard({ data, error, onClear }: Props) {
  // Auto-clear success after 8 seconds
  useEffect(() => {
    if (!data && !error) return;
    const timer = setTimeout(() => {
      onClear();
    }, 8000);
    return () => clearTimeout(timer);
  }, [data, error]);

  if (!data && !error) return null;

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      return new Date(isoString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila',
      });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border transition-all duration-300">
      {/* Error / Duplicate Alert */}
      {error && (
        <div className="border-red-200 bg-red-50 p-4 text-red-900 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
              <div>
                <h4 className="text-sm font-bold text-red-950">Attendance Not Recorded</h4>
                <p className="mt-1 text-xs leading-relaxed text-red-800">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="rounded-md p-1 text-red-400 hover:bg-red-100 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Confirmation Card */}
      {data && (
        <div className="border-emerald-300 bg-emerald-50/90 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-950 uppercase">
                  Confirmed Check-in
                </span>
                <h4 className="mt-1 text-lg font-extrabold text-slate-900">
                  {data.full_name}
                </h4>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  {data.reference_code && (
                    <span className="font-mono font-semibold text-emerald-800">
                      {data.reference_code}
                    </span>
                  )}
                  {data.barangay && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      Brgy. {data.barangay}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {formatTime(data.attended_at)}
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs border border-slate-200">
                    Via {data.method === 'qr' ? 'QR Code' : 'Manual Entry'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClear}
              className="rounded-md p-1 text-slate-400 hover:bg-emerald-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

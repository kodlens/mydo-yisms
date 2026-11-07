import { CheckCircle, Clock, Hash, QrCode, TrendingUp, Users } from 'lucide-react';

export type AttendanceSummary = {
  approved_registrations_count: number;
  attended_count: number;
  unattended_count: number;
  qr_count: number;
  manual_count: number;
  attendance_rate: number;
  capacity: number | null;
};

type Props = {
  summary: AttendanceSummary;
};

export default function AttendanceStatsBar({ summary }: Props) {
  const percent = Math.min(100, summary.attendance_rate || 0);

  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Attended */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Attended
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
            <CheckCircle className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{summary.attended_count}</span>
          <span className="text-xs text-slate-500">
            / {summary.approved_registrations_count} registered
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-emerald-700">
          {summary.attendance_rate}% turnout rate
        </p>
      </div>

      {/* Expected Remaining */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Awaiting Check-in
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <Clock className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{summary.unattended_count}</span>
          <span className="text-xs text-slate-500">attendees left</span>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Out of {summary.approved_registrations_count} confirmed sign-ups
        </p>
      </div>

      {/* Check-in Methods */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Check-in Methods
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
            <QrCode className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="h-2 w-2 rounded-full bg-sky-500"></span>
            <span>QR Scan:</span>
            <strong className="text-slate-900">{summary.qr_count}</strong>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Manual:</span>
            <strong className="text-slate-900">{summary.manual_count}</strong>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Fast verification via camera scanner & ID entry
        </p>
      </div>

      {/* Capacity & Limits */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Event Capacity
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
            <Users className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">
            {summary.capacity !== null ? summary.capacity : 'Unlimited'}
          </span>
          {summary.capacity !== null && (
            <span className="text-xs text-slate-500">
              ({Math.max(0, summary.capacity - summary.attended_count)} seats open)
            </span>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          MYDO Official Activity Roster
        </p>
      </div>
    </div>
  );
}

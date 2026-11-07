import { CashIncentiveProgramSummary } from '@/types/cash-incentive';
import { Progress } from 'antd';
import {
  Banknote,
  Coins,
  DollarSign,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';

export default function ProgramBudgetStatsBar({ summary }: { summary: CashIncentiveProgramSummary }) {
  const formatPesos = (val: number) =>
    '₱' + val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Allocated Budget */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Allocated Budget
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Wallet size={18} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{formatPesos(summary.allocated_budget)}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Per Beneficiary:</span>
            <span className="font-bold text-slate-700">{formatPesos(summary.amount_per_beneficiary)}</span>
          </div>
        </div>

        {/* Disbursed Amount */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Total Disbursed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
              <Banknote size={18} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">{formatPesos(summary.released_amount)}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-700">
            <span>{summary.released_count} Beneficiaries Paid</span>
            <span className="font-bold">{summary.budget_utilization_rate}% Utilized</span>
          </div>
        </div>

        {/* Committed Amount */}
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
              Approved Commitment
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-2xs">
              <Coins size={18} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-cyan-900">{formatPesos(summary.committed_amount)}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-cyan-700">
            <span>{summary.approved_count} Approved of {summary.max_beneficiaries} Max</span>
            <span className="font-bold">{summary.release_rate}% Disbursed</span>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Remaining Balance
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{formatPesos(summary.remaining_budget)}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Slots Remaining:</span>
            <span className="font-bold text-slate-700">
              {Math.max(0, summary.max_beneficiaries - summary.approved_count)} slots
            </span>
          </div>
        </div>
      </div>

      {/* Progress Trackers */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Disbursement & Quota Progress
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Disbursed ({summary.released_count})
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Approved Pending Release ({summary.pending_release_count + summary.scheduled_release_count})
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Under Review ({summary.pending_review_count})
            </span>
          </div>
        </div>

        <Progress
          percent={summary.budget_utilization_rate}
          strokeColor={{
            '0%': '#10b981',
            '100%': '#059669',
          }}
          trailColor="#e2e8f0"
          strokeWidth={12}
        />
      </div>
    </div>
  );
}

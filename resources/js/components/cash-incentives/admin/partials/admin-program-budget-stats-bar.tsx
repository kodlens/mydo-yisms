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

export default function AdminProgramBudgetStatsBar({ summary }: { summary: CashIncentiveProgramSummary }) {
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
            <span>{summary.approved_beneficiaries_count} Approved Students</span>
            <span className="font-bold">Pending: {formatPesos(summary.pending_disbursement_amount)}</span>
          </div>
        </div>

        {/* Remaining Uncommitted Balance */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Remaining Budget
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-2xs">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">{formatPesos(summary.remaining_balance)}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-amber-800">
            <span>Quota Left:</span>
            <span className="font-bold">
              {Math.max(0, summary.max_beneficiaries - summary.approved_beneficiaries_count)} slots
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Slots Overview */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-600" />
            <span className="text-sm font-bold text-slate-800">
              Beneficiary Enrollment & Disbursement Status
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500">
              Total Selected: <strong className="text-slate-800">{summary.total_beneficiaries_count}</strong>
            </span>
            <span className="text-emerald-700">
              Approved: <strong>{summary.approved_beneficiaries_count}</strong>
            </span>
            <span className="text-amber-600">
              Pending: <strong>{summary.pending_beneficiaries_count}</strong>
            </span>
            <span className="text-rose-600">
              Rejected: <strong>{summary.rejected_beneficiaries_count}</strong>
            </span>
            <span className="text-blue-700 font-semibold">
              Max Quota: <strong>{summary.max_beneficiaries}</strong>
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Budget Disbursement Rate</span>
            <span className="font-bold text-slate-800">{summary.budget_utilization_rate}%</span>
          </div>
          <Progress
            percent={summary.budget_utilization_rate}
            status="active"
            strokeColor={{ from: '#10b981', to: '#059669' }}
            showInfo={false}
          />
        </div>
      </div>
    </div>
  );
}

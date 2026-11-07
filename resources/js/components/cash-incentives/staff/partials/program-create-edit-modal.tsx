import { CashIncentiveProgram } from '@/types/cash-incentive';
import { useForm } from '@inertiajs/react';
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { Coins, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  program?: CashIncentiveProgram | null;
};

export default function ProgramCreateEditModal({ open, onClose, program }: Props) {
  const isEditing = !!program;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: program?.title ?? '',
    code: program?.code ?? '',
    description: program?.description ?? '',
    funding_year: program?.funding_year ?? new Date().getFullYear(),
    amount_per_beneficiary: program?.amount_per_beneficiary ?? 5000,
    allocated_budget: program?.allocated_budget ?? 500000,
    max_beneficiaries: program?.max_beneficiaries ?? 100,
    selection_start_date: program?.selection_start_date ?? null,
    selection_end_date: program?.selection_end_date ?? null,
    release_start_date: program?.release_start_date ?? null,
    release_end_date: program?.release_end_date ?? null,
    status: program?.status ?? 'active',
  });

  useEffect(() => {
    if (program) {
      setData({
        title: program.title,
        code: program.code,
        description: program.description ?? '',
        funding_year: program.funding_year,
        amount_per_beneficiary: program.amount_per_beneficiary,
        allocated_budget: program.allocated_budget,
        max_beneficiaries: program.max_beneficiaries,
        selection_start_date: program.selection_start_date ?? null,
        selection_end_date: program.selection_end_date ?? null,
        release_start_date: program.release_start_date ?? null,
        release_end_date: program.release_end_date ?? null,
        status: program.status,
      });
    } else {
      reset();
    }
  }, [program, open]);

  const minRequiredBudget = Number(data.max_beneficiaries || 0) * Number(data.amount_per_beneficiary || 0);

  const handleSubmit = () => {
    if (isEditing) {
      put(route('staff.cash-incentives.update', program.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('staff.cash-incentives.store'), {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Coins size={18} />
          </div>
          <span className="font-bold text-base">
            {isEditing ? `Edit Program: ${program.code}` : 'New Cash Incentive Program'}
          </span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onClose} disabled={processing}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={processing}
          className="!bg-emerald-600 hover:!bg-emerald-700"
        >
          {isEditing ? 'Save Changes' : 'Create Program'}
        </Button>,
      ]}
      width={720}
    >
      <div className="mt-4 space-y-4">
        {/* Title & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Program Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              placeholder="e.g., Tertiary Education Financial Aid 2026"
              size="large"
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Program Code</label>
            <Input
              value={data.code}
              onChange={(e) => setData('code', e.target.value)}
              placeholder="Auto-generated if blank"
              size="large"
            />
            {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
          </div>
        </div>

        {/* Funding Year, Per Beneficiary Amount, Max Beneficiaries */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Funding Year <span className="text-rose-500">*</span>
            </label>
            <InputNumber
              value={data.funding_year}
              onChange={(val) => setData('funding_year', val || new Date().getFullYear())}
              min={2020}
              max={2050}
              className="w-full !h-10"
            />
            {errors.funding_year && <p className="text-xs text-rose-500 mt-1">{errors.funding_year}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fixed Amount (₱ / Beneficiary) <span className="text-rose-500">*</span>
            </label>
            <InputNumber
              value={data.amount_per_beneficiary}
              onChange={(val) => setData('amount_per_beneficiary', Number(val || 0))}
              formatter={(value) => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/₱\s?|(,*)/g, '') as any}
              min={1}
              step={500}
              className="w-full !h-10"
            />
            {errors.amount_per_beneficiary && (
              <p className="text-xs text-rose-500 mt-1">{errors.amount_per_beneficiary}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Max Beneficiaries <span className="text-rose-500">*</span>
            </label>
            <InputNumber
              value={data.max_beneficiaries}
              onChange={(val) => setData('max_beneficiaries', Number(val || 0))}
              min={1}
              className="w-full !h-10"
            />
            {errors.max_beneficiaries && (
              <p className="text-xs text-rose-500 mt-1">{errors.max_beneficiaries}</p>
            )}
          </div>
        </div>

        {/* Allocated Budget & Budget Validation Warning */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Total Allocated Budget (₱) <span className="text-rose-500">*</span>
          </label>
          <InputNumber
            value={data.allocated_budget}
            onChange={(val) => setData('allocated_budget', Number(val || 0))}
            formatter={(value) => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value?.replace(/₱\s?|(,*)/g, '') as any}
            min={minRequiredBudget}
            step={10000}
            className="w-full !h-10"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Required minimum: <strong>₱{minRequiredBudget.toLocaleString()}</strong> ({data.max_beneficiaries} × ₱
              {Number(data.amount_per_beneficiary).toLocaleString()})
            </span>
            {Number(data.allocated_budget) < minRequiredBudget && (
              <span className="text-rose-600 font-bold">⚠️ Budget cannot be less than required commitment!</span>
            )}
          </div>
          {errors.allocated_budget && (
            <p className="text-xs text-rose-500 mt-1">{errors.allocated_budget}</p>
          )}
        </div>

        {/* Date Periods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60">
            <span className="block text-xs font-bold text-slate-700 mb-2">Selection Period</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">Start Date</span>
                <DatePicker
                  value={data.selection_start_date ? dayjs(data.selection_start_date) : null}
                  onChange={(d) => setData('selection_start_date', d ? d.format('YYYY-MM-DD') : null)}
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">End Date</span>
                <DatePicker
                  value={data.selection_end_date ? dayjs(data.selection_end_date) : null}
                  onChange={(d) => setData('selection_end_date', d ? d.format('YYYY-MM-DD') : null)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60">
            <span className="block text-xs font-bold text-slate-700 mb-2">Disbursement Period</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">Start Date</span>
                <DatePicker
                  value={data.release_start_date ? dayjs(data.release_start_date) : null}
                  onChange={(d) => setData('release_start_date', d ? d.format('YYYY-MM-DD') : null)}
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">End Date</span>
                <DatePicker
                  value={data.release_end_date ? dayjs(data.release_end_date) : null}
                  onChange={(d) => setData('release_end_date', d ? d.format('YYYY-MM-DD') : null)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Program Status <span className="text-rose-500">*</span>
            </label>
            <Select
              value={data.status}
              onChange={(val) => setData('status', val)}
              className="w-full !h-10"
              options={[
                { value: 'active', label: 'Active (Open for Selection)' },
                { value: 'draft', label: 'Draft' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Guidelines</label>
            <Input.TextArea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              placeholder="Eligibility criteria, payout guidelines, etc."
              rows={2}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

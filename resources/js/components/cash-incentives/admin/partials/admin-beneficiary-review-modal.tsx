import { CashIncentiveBeneficiary, CashIncentiveProgram } from '@/types/cash-incentive';
import { useForm } from '@inertiajs/react';
import {
  Alert,
  Button,
  Descriptions,
  Input,
  Modal,
  Radio,
  Select,
} from 'antd';
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  beneficiary: CashIncentiveBeneficiary | null;
  program: CashIncentiveProgram;
};

const COMMON_REJECTION_REASONS = [
  'Ineligible residency / Not a bona fide resident of the municipality',
  'Monthly family income exceeds the eligibility ceiling for this program',
  'Already received another government cash assistance or financial subsidy for this period',
  'Incomplete documentary credentials or failure to provide enrollment verification',
  'Disqualified due to academic / age criteria (must be 15 to 30 years old)',
  'Other / Custom reason',
];

export default function AdminBeneficiaryReviewModal({
  open,
  onClose,
  beneficiary,
  program,
}: Props) {
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [presetReason, setPresetReason] = useState<string>(COMMON_REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    status: 'approved',
    rejection_reason: '',
    remarks: '',
  });

  useEffect(() => {
    if (open) {
      setDecision('approved');
      setPresetReason(COMMON_REJECTION_REASONS[0]);
      setCustomReason('');
      setData({
        status: 'approved',
        rejection_reason: '',
        remarks: '',
      });
    }
  }, [open, beneficiary]);

  if (!beneficiary) return null;

  const handleDecisionChange = (val: 'approved' | 'rejected') => {
    setDecision(val);
    setData('status', val);
    if (val === 'approved') {
      setData('rejection_reason', '');
    } else {
      setData('rejection_reason', presetReason === 'Other / Custom reason' ? customReason : presetReason);
    }
  };

  const handleReasonPreset = (val: string) => {
    setPresetReason(val);
    if (val !== 'Other / Custom reason') {
      setData('rejection_reason', val);
    } else {
      setData('rejection_reason', customReason);
    }
  };

  const handleCustomReasonChange = (val: string) => {
    setCustomReason(val);
    setData('rejection_reason', val);
  };

  const handleSubmit = () => {
    post(
      route('admin.cash-incentives.beneficiaries.review', [program.id, beneficiary.id]),
      {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <ShieldCheck size={18} />
          </div>
          <span className="font-bold text-base">Eligibility Review: {beneficiary.full_name}</span>
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
          className={
            decision === 'approved'
              ? '!bg-emerald-600 hover:!bg-emerald-700'
              : '!bg-rose-600 hover:!bg-rose-700'
          }
        >
          {decision === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
        </Button>,
      ]}
      width={640}
    >
      <div className="space-y-4 py-2">
        {/* Beneficiary Details Summary Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
          <Descriptions size="small" column={2} className="text-slate-700">
            <Descriptions.Item label="Reference Code">
              <span className="font-mono font-bold text-slate-800">{beneficiary.reference_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Barangay">
              <span className="font-semibold">{beneficiary.barangay}</span>
            </Descriptions.Item>
            <Descriptions.Item label="School / Institution">
              <span>{beneficiary.school_name || 'N/A'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Course / Program">
              <span>{beneficiary.program || 'N/A'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Educational Status">
              <span className="font-semibold text-emerald-800">{beneficiary.educational_status || 'N/A'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Monthly Family Income">
              <span>₱{Number(beneficiary.monthly_family_income || 0).toLocaleString()}</span>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Decision Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Eligibility Action Decision
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDecisionChange('approved')}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-bold transition-all text-sm ${
                decision === 'approved'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 size={18} className={decision === 'approved' ? 'text-emerald-600' : 'text-slate-400'} />
              Approve for Cash Release
            </button>

            <button
              type="button"
              onClick={() => handleDecisionChange('rejected')}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-bold transition-all text-sm ${
                decision === 'rejected'
                  ? 'border-rose-600 bg-rose-50 text-rose-800 shadow-xs ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <XCircle size={18} className={decision === 'rejected' ? 'text-rose-600' : 'text-slate-400'} />
              Reject Eligibility
            </button>
          </div>
        </div>

        {/* Rejection Reasons Options */}
        {decision === 'rejected' && (
          <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 text-xs">
            <div>
              <label className="font-bold text-rose-900 block mb-1">
                Primary Reason for Ineligibility <span className="text-rose-600">*</span>
              </label>
              <Select
                className="w-full"
                value={presetReason}
                onChange={handleReasonPreset}
                options={COMMON_REJECTION_REASONS.map((r) => ({ value: r, label: r }))}
              />
            </div>

            {presetReason === 'Other / Custom reason' && (
              <div>
                <label className="font-semibold text-rose-900 block mb-1">
                  Specify Ineligibility Grounds <span className="text-rose-600">*</span>
                </label>
                <Input.TextArea
                  rows={2}
                  placeholder="Detail why applicant does not qualify for this program..."
                  value={customReason}
                  onChange={(e) => handleCustomReasonChange(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Administrative Notes & Remarks (Optional)
          </label>
          <Input.TextArea
            rows={2}
            placeholder="Official review notes, verified documents, or reference memorandum..."
            value={data.remarks}
            onChange={(e) => setData('remarks', e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

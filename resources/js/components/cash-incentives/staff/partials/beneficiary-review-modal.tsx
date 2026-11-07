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

export default function BeneficiaryReviewModal({
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
      route('staff.cash-incentives.beneficiaries.review', [program.id, beneficiary.id]),
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
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
              ? '!bg-emerald-600 hover:!bg-emerald-700 font-semibold'
              : '!bg-rose-600 hover:!bg-rose-700 font-semibold'
          }
        >
          {decision === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
        </Button>,
      ]}
      width={680}
    >
      <div className="mt-3 space-y-4">
        {/* Candidate Summary Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Reference Code</span>
              <span className="font-mono font-bold text-slate-800">{beneficiary.reference_code || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Barangay</span>
              <span className="font-bold text-slate-800">{beneficiary.barangay}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Educational Status</span>
              <span className="font-bold text-slate-800">{beneficiary.educational_status || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Fixed Incentive</span>
              <span className="font-bold text-emerald-700">₱{program.amount_per_beneficiary.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Decision Toggle */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Review Decision</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDecisionChange('approved')}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-bold text-sm transition ${
                decision === 'approved'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 size={18} className={decision === 'approved' ? 'text-emerald-600' : 'text-slate-400'} />
              Approve for Incentive
            </button>

            <button
              type="button"
              onClick={() => handleDecisionChange('rejected')}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-bold text-sm transition ${
                decision === 'rejected'
                  ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/30'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <XCircle size={18} className={decision === 'rejected' ? 'text-rose-600' : 'text-slate-400'} />
              Reject Candidate
            </button>
          </div>
        </div>

        {/* Approval Notice */}
        {decision === 'approved' && (
          <Alert
            type="success"
            showIcon
            message="Approval Commitment"
            description={`Approving this beneficiary will verify their eligibility and schedule a disbursement record of ₱${program.amount_per_beneficiary.toLocaleString()}. Only approved beneficiaries can proceed to cash release.`}
          />
        )}

        {/* Rejection Details */}
        {decision === 'rejected' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <Select
                value={presetReason}
                onChange={handleReasonPreset}
                className="w-full !h-10"
                options={COMMON_REJECTION_REASONS.map((r) => ({ value: r, label: r }))}
              />
            </div>

            {presetReason === 'Other / Custom reason' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specify Detailed Reason <span className="text-rose-500">*</span>
                </label>
                <Input.TextArea
                  rows={2}
                  value={customReason}
                  onChange={(e) => handleCustomReasonChange(e.target.value)}
                  placeholder="State the specific legal or documentary disqualification reason..."
                />
              </div>
            )}
            {errors.rejection_reason && (
              <p className="text-xs text-rose-500">{errors.rejection_reason}</p>
            )}
          </div>
        )}

        {/* Optional Review Remarks */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Review Notes / Remarks (Optional)</label>
          <Input.TextArea
            rows={2}
            value={data.remarks}
            onChange={(e) => setData('remarks', e.target.value)}
            placeholder="Add internal notes on documents presented, interviews conducted, etc."
          />
        </div>
      </div>
    </Modal>
  );
}

import { CashIncentiveBeneficiary, CashIncentiveProgram } from '@/types/cash-incentive';
import { router } from '@inertiajs/react';
import { Button, Input, Modal, message } from 'antd';
import { Banknote, CheckCircle2, User } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  beneficiary: CashIncentiveBeneficiary | null;
  program: CashIncentiveProgram;
};

export default function CashReleaseModal({
  open,
  onClose,
  beneficiary,
  program,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [ackRef, setAckRef] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (open && beneficiary) {
      setAckRef('');
      setRemarks('');
    }
  }, [open, beneficiary]);

  if (!beneficiary) return null;

  const handleSubmit = () => {
    setSubmitting(true);
    router.post(
      route('staff.cash-incentives.releases.record', [program.id, beneficiary.id]),
      {
        acknowledgment_reference: ackRef,
        remarks: remarks,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSubmitting(false);
          message.success(`Cash incentive released to ${beneficiary.full_name}!`);
          onClose();
        },
        onError: (errs) => {
          setSubmitting(false);
          const first = Object.values(errs)[0];
          message.error(first ? String(first) : 'Failed to record release.');
        },
      }
    );
  };

  const formattedAmount = '₱' + Number(program.amount_per_beneficiary).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
            <Banknote size={18} />
          </div>
          <span className="font-bold text-base">Release Cash Incentive</span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
          className="!bg-emerald-600 hover:!bg-emerald-700 font-bold"
        >
          Confirm & Release Cash ({formattedAmount})
        </Button>,
      ]}
      width={520}
    >
      <div className="mt-3 space-y-4">
        {/* Recipient Details Pill */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Recipient Student
              </span>
              <p className="text-base font-black text-slate-900 truncate">{beneficiary.full_name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5 flex-wrap">
                {beneficiary.reference_code && (
                  <span className="font-mono font-bold text-emerald-950 bg-white px-1.5 py-0.2 rounded border border-emerald-300">
                    {beneficiary.reference_code}
                  </span>
                )}
                <span>•</span>
                <span>{beneficiary.barangay}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Cash Amount</span>
              <span className="text-2xl font-black text-emerald-700">{formattedAmount}</span>
            </div>
          </div>
        </div>

        {/* Optional Reference & Notes */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payroll Line / Voucher # (Optional)
            </label>
            <Input
              value={ackRef}
              onChange={(e) => setAckRef(e.target.value)}
              placeholder="e.g. PR-001, Line #12 (leave blank to auto-generate)"
              size="large"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Remarks (Optional)
            </label>
            <Input
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Claimed in person at Municipal Hall"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          Clicking confirm will instantly record the payout, log your staff account, and deduct {formattedAmount} from the program balance.
        </p>
      </div>
    </Modal>
  );
}

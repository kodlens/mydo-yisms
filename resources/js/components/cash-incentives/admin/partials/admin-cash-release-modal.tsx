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

export default function AdminCashReleaseModal({
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
      route('admin.cash-incentives.releases.record', [program.id, beneficiary.id]),
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Banknote size={18} />
          </div>
          <span className="font-bold text-base">Record Cash Release Disbursement</span>
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
          icon={<CheckCircle2 size={16} />}
          className="!bg-emerald-600 hover:!bg-emerald-700"
        >
          Confirm Cash Disbursement
        </Button>,
      ]}
      width={520}
    >
      <div className="space-y-4 py-2">
        {/* Recipient summary banner */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <User size={16} className="text-emerald-800" />
              <span className="font-bold text-emerald-950 text-sm">{beneficiary.full_name}</span>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-800">
              {beneficiary.reference_code}
            </span>
          </div>

          <div className="flex items-baseline justify-between border-t border-emerald-200/60 pt-2 text-xs">
            <span className="text-emerald-800">Incentive Amount:</span>
            <span className="text-xl font-black text-emerald-950 font-mono">{formattedAmount}</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Acknowledgment Receipt / Voucher Reference
            </label>
            <Input
              placeholder="e.g. AR-2026-0891 or Payroll Sheet Page #2"
              value={ackRef}
              onChange={(e) => setAckRef(e.target.value)}
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Reference code from the signed payroll sheet or official disbursement voucher.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Disbursement Notes & Remarks (Optional)
            </label>
            <Input.TextArea
              rows={2}
              placeholder="Received in cash, verified valid student ID, released at municipal hall..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

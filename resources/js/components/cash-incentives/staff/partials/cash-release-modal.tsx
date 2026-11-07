import { CashIncentiveBeneficiary, CashIncentiveProgram } from '@/types/cash-incentive';
import { useForm } from '@inertiajs/react';
import {
  Alert,
  Button,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import { Banknote, FileCheck, Upload as UploadIcon } from 'lucide-react';
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
  const [fileList, setFileList] = useState<any[]>([]);

  const { data, setData, post, processing, errors, reset } = useForm<{
    amount: number;
    acknowledgment_reference: string;
    actual_release_date: string;
    supporting_document: File | null;
    remarks: string;
  }>({
    amount: program.amount_per_beneficiary,
    acknowledgment_reference: '',
    actual_release_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    supporting_document: null,
    remarks: '',
  });

  useEffect(() => {
    if (open && beneficiary) {
      setFileList([]);
      setData({
        amount: program.amount_per_beneficiary,
        acknowledgment_reference: '',
        actual_release_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        supporting_document: null,
        remarks: '',
      });
    }
  }, [open, beneficiary]);

  if (!beneficiary) return null;

  const handleSubmit = () => {
    post(
      route('staff.cash-incentives.releases.record', [program.id, beneficiary.id]),
      {
        forceFormData: true,
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
            <Banknote size={18} />
          </div>
          <span className="font-bold text-base">Record Cash Release Disbursement</span>
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
          className="!bg-emerald-600 hover:!bg-emerald-700 font-semibold"
        >
          Confirm Cash Disbursement
        </Button>,
      ]}
      width={640}
    >
      <div className="mt-3 space-y-4">
        {/* Recipient Details Pill */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-emerald-800 tracking-wider block">
                Beneficiary Recipient
              </span>
              <p className="text-base font-black text-slate-900">{beneficiary.full_name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                <span className="font-mono text-emerald-950 font-bold">{beneficiary.reference_code}</span>
                <span>•</span>
                <span>{beneficiary.barangay}</span>
                <span>•</span>
                <span>{beneficiary.educational_status}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Disbursement Amount</span>
              <span className="text-2xl font-black text-emerald-700">
                ₱{program.amount_per_beneficiary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3">
          {/* Acknowledgment Reference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Acknowledgment Reference / Voucher # <span className="text-rose-500">*</span>
            </label>
            <Input
              value={data.acknowledgment_reference}
              onChange={(e) => setData('acknowledgment_reference', e.target.value)}
              placeholder="e.g., PR-2026-081, VOUCHER-492, or AR-1029"
              size="large"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Official payroll sheet line reference, disbursement voucher number, or signed acknowledgment serial.
            </p>
            {errors.acknowledgment_reference && (
              <p className="text-xs text-rose-500 mt-1">{errors.acknowledgment_reference}</p>
            )}
          </div>

          {/* Release Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Actual Release Date</label>
            <DatePicker
              showTime
              value={dayjs(data.actual_release_date)}
              onChange={(d) => setData('actual_release_date', d ? d.format('YYYY-MM-DD HH:mm:ss') : '')}
              className="w-full !h-10"
            />
            {errors.actual_release_date && (
              <p className="text-xs text-rose-500 mt-1">{errors.actual_release_date}</p>
            )}
          </div>

          {/* Supporting Document Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supporting Document / Signed Receipt (Optional)
            </label>
            <Upload
              beforeUpload={(file) => {
                setData('supporting_document', file);
                setFileList([file]);
                return false;
              }}
              fileList={fileList}
              onRemove={() => {
                setData('supporting_document', null);
                setFileList([]);
              }}
              maxCount={1}
              accept=".pdf,.jpg,.jpeg,.png"
            >
              <Button icon={<UploadIcon size={14} />}>Select Scanned Payroll / Receipt File</Button>
            </Upload>
            <p className="text-[11px] text-slate-500 mt-1">Accepts PDF, JPG, or PNG (up to 10MB).</p>
            {errors.supporting_document && (
              <p className="text-xs text-rose-500 mt-1">{errors.supporting_document}</p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Disbursement Remarks (Optional)</label>
            <Input.TextArea
              rows={2}
              value={data.remarks}
              onChange={(e) => setData('remarks', e.target.value)}
              placeholder="e.g., Claimed in person at Municipal Hall with valid government ID..."
            />
          </div>
        </div>

        <Alert
          type="info"
          showIcon
          message="Financial Transaction Safeguard"
          description="Recording this release will mark the financial transaction as complete and deduct the amount from remaining program funds. Standard users cannot modify or delete confirmed releases."
        />
      </div>
    </Modal>
  );
}

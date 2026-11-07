import BrandLogo from '@/components/brand-logo';
import MydoLogo from '@/components/mydo-logo';
import { Button, Modal, QRCode, message } from 'antd';
import { CheckCircle2, Copy, Download, Info, QrCode as QrIcon, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export type YouthPassData = {
  id: number;
  reference_code?: string;
  student_id?: string;
  full_name: string;
  email?: string;
  barangay?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  youth: YouthPassData | null;
  activityTitle?: string;
};

export default function YouthEventPassModal({
  open,
  onClose,
  youth,
  activityTitle,
}: Props) {
  const [copied, setCopied] = useState(false);

  if (!youth || !youth.reference_code) return null;

  const handleCopy = () => {
    if (!youth.reference_code) return;
    navigator.clipboard.writeText(youth.reference_code);
    setCopied(true);
    message.success('Reference code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={420}
      className="[&_.ant-modal-content]:p-0 [&_.ant-modal-content]:overflow-hidden [&_.ant-modal-content]:rounded-2xl"
    >
      <div className="bg-gradient-to-b from-emerald-800 to-emerald-950 px-6 py-6 text-white text-center">
        {/* Header Badges & Logos */}
        <div className="flex items-center justify-center gap-2">
          <MydoLogo className="h-8 w-8 rounded-full bg-white p-0.5" />
          <div className="h-5 w-px bg-white/20" />
          <BrandLogo className="h-6 w-6 rounded bg-white/10 p-0.5" />
        </div>

        <span className="mt-2 inline-block text-[11px] font-bold tracking-wider uppercase text-emerald-300">
          Municipal Youth Development Office
        </span>
        <h3 className="text-lg font-black tracking-tight text-white">
          Official Youth Event Pass
        </h3>
        {activityTitle && (
          <p className="mt-1 text-xs text-emerald-200 line-clamp-1">
            {activityTitle}
          </p>
        )}
      </div>

      <div className="p-6 text-center">
        {/* QR Code Container */}
        <div className="mx-auto flex w-fit items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-4 ring-emerald-50">
          <QRCode
            value={youth.reference_code}
            size={180}
            bordered={false}
            errorLevel="M"
          />
        </div>

        {/* Reference Code Box */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <code className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-base font-extrabold tracking-wider text-emerald-900 border border-slate-200">
            {youth.reference_code}
          </code>
          <Button
            size="small"
            type="text"
            icon={<Copy className="h-3.5 w-3.5 text-slate-500" />}
            onClick={handleCopy}
            title="Copy reference code"
          />
        </div>

        {/* Member Details */}
        <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-900 text-sm">{youth.full_name}</p>
          {youth.barangay && <p>Barangay: <strong className="text-slate-800">{youth.barangay}</strong></p>}
          {youth.student_id && <p>ID: <strong className="text-slate-800">{youth.student_id}</strong></p>}
        </div>

        {/* Instruction Note */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-left text-xs text-emerald-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <p>
            Present this QR code to the MYDO attendance desk upon arrival. If the scanner is busy, staff can record your attendance using the reference code above.
          </p>
        </div>

        <Button
          type="primary"
          block
          size="large"
          onClick={onClose}
          className="mt-5 !bg-emerald-700 font-bold !text-white hover:!bg-emerald-800"
        >
          Done
        </Button>
      </div>
    </Modal>
  );
}

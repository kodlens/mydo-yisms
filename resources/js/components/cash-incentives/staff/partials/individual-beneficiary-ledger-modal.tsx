import { CashIncentiveBeneficiary, CashIncentiveProgram } from '@/types/cash-incentive';
import { Button, Descriptions, Divider, Modal, Tag, Timeline } from 'antd';
import {
  Banknote,
  Calendar,
  ExternalLink,
  FileText,
  MapPin,
  Printer,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BeneficiaryStatusBadge, ReleaseStatusBadge } from './release-status-badge';

type Props = {
  open: boolean;
  onClose: () => void;
  beneficiary: CashIncentiveBeneficiary | null;
  program: CashIncentiveProgram;
};

export default function IndividualBeneficiaryLedgerModal({
  open,
  onClose,
  beneficiary,
  program,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    if (open && beneficiary) {
      setLoading(true);
      fetch(
        route('staff.cash-incentives.reports.individual', [program.id, beneficiary.id]),
        { headers: { Accept: 'application/json' } }
      )
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((json) => {
          if (json?.report) setReportData(json.report);
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    } else {
      setReportData(null);
    }
  }, [open, beneficiary]);

  if (!beneficiary) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center justify-between pr-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Beneficiary Dossier & Audit Ledger</h3>
              <p className="text-[11px] text-slate-500 font-mono">{beneficiary.reference_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BeneficiaryStatusBadge status={beneficiary.status} />
            <ReleaseStatusBadge status={beneficiary.release?.status} />
          </div>
        </div>
      }
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<Printer size={14} />}
          onClick={() => window.open(route('staff.cash-incentives.reports.individual', [program.id, beneficiary.id]), '_blank')}
          className="!bg-emerald-600 hover:!bg-emerald-700"
        >
          Print Official Dossier
        </Button>,
      ]}
      width={740}
    >
      <div className="mt-3 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Recipient Profile */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
            <User size={14} /> Demographic & Educational Profile
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Full Name</span>
              <span className="font-bold text-slate-900">{beneficiary.full_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Reference Code</span>
              <span className="font-mono font-bold text-emerald-800">{beneficiary.reference_code || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Barangay</span>
              <span className="font-bold text-slate-800">{beneficiary.barangay}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Educational Status</span>
              <span className="font-bold text-slate-800">{beneficiary.educational_status || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">School / Institution</span>
              <span className="font-bold text-slate-800">{beneficiary.school_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Course / Program</span>
              <span className="font-bold text-slate-800">{beneficiary.program || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Financial Disbursement Summary */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
            <Banknote size={14} /> Incentive Disbursement Transaction
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-emerald-700 block">Program Fixed Amount</span>
              <span className="font-mono font-black text-emerald-950 text-base">
                ₱{program.amount_per_beneficiary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-emerald-700 block">Disbursement Status</span>
              <div className="mt-0.5">
                <ReleaseStatusBadge status={beneficiary.release?.status} />
              </div>
            </div>
            <div>
              <span className="text-emerald-700 block">Acknowledgment Reference</span>
              <span className="font-mono font-bold text-slate-900">
                {beneficiary.release?.acknowledgment_reference || 'Pending Release'}
              </span>
            </div>
            <div>
              <span className="text-emerald-700 block">Release Date</span>
              <span className="font-bold text-slate-800">
                {beneficiary.release?.actual_release_date || 'Not disbursed yet'}
              </span>
            </div>
            <div>
              <span className="text-emerald-700 block">Disbursing Officer</span>
              <span className="font-bold text-slate-800">
                {beneficiary.release?.released_by || 'N/A'}
              </span>
            </div>
            {beneficiary.release?.supporting_document_url && (
              <div>
                <span className="text-emerald-700 block">Disbursement Receipt</span>
                <a
                  href={beneficiary.release.supporting_document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 underline inline-flex items-center gap-1"
                >
                  View Attachment <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Eligibility Review Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
            <ShieldCheck size={14} /> Review Audit Details
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Selected Date</span>
              <span className="font-bold text-slate-800">{beneficiary.selected_at || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Selected By</span>
              <span className="font-bold text-slate-800">{beneficiary.selected_by || 'Staff'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Review Timestamp</span>
              <span className="font-bold text-slate-800">{beneficiary.reviewed_at || 'Pending'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Reviewing Staff</span>
              <span className="font-bold text-slate-800">{beneficiary.reviewed_by || 'Pending'}</span>
            </div>
            {beneficiary.rejection_reason && (
              <div className="col-span-2">
                <span className="text-rose-600 font-bold block">Rejection Reason</span>
                <span className="text-slate-800">{beneficiary.rejection_reason}</span>
              </div>
            )}
            {beneficiary.remarks && (
              <div className="col-span-2">
                <span className="text-slate-400 block">Staff Remarks</span>
                <span className="text-slate-800">{beneficiary.remarks}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
